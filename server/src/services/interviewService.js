const QUESTION_COUNT = 5;

const callLlama = async (systemPrompt, userPrompt) => {
  const apiUrl = process.env.LLAMA_API_URL;
  const apiKey = process.env.LLAMA_API_KEY;
  const model = process.env.LLAMA_MODEL || "llama-3.3-70b-versatile";

  if (!apiUrl || !apiKey) {
    throw new Error("Llama API is not configured. Set LLAMA_API_URL and LLAMA_API_KEY in .env");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`Llama API request failed (${response.status}): ${errBody.slice(0, 300)}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("Llama API returned an empty response");
  }

  const cleaned = rawContent
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "");

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Failed to parse Llama API response as JSON");
  }
};

const QUESTION_GEN_SYSTEM_PROMPT = `You are an expert technical interviewer. Generate realistic interview questions for a candidate based on the given configuration.

Return ONLY a single valid JSON object (no markdown fences, no commentary) with this exact shape:

{
  "questions": [
    {
      "type": "mcq" | "technical" | "scenario" | "hr",
      "prompt": "<the question text>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "correctOptionIndex": <integer 0-3, only for type "mcq", omit for other types>,
      "modelAnswerNotes": "<brief notes on what a strong answer should cover, used later to grade the candidate; omit for type mcq>"
    }
  ]
}

Rules:
- Generate exactly ${QUESTION_COUNT} questions.
- If interviewType is "mixed", vary the types across technical, scenario, and hr (no mcq unless asked).
- If interviewType is a specific type, every question must be that type.
- Only "mcq" questions have "options" and "correctOptionIndex". All other types must omit both fields entirely.
- Non-mcq questions must have "modelAnswerNotes" and must omit "options" and "correctOptionIndex".
- Match the requested difficulty level (1 = easy/entry-level, 5 = expert-level, high-pressure).
- Base questions on the target role, experience level, and skills provided. If resume context is given, personalize at least two questions to it.
- Return ONLY the JSON object, nothing else.`;

export const generateInterviewQuestions = async (config) => {
  const { targetRole, experienceLevel, skills, interviewType, difficulty, resumeContext } = config;

  const userPrompt = `Target role: ${targetRole}
Experience level: ${experienceLevel}
Skills: ${skills.join(", ") || "not specified"}
Interview type: ${interviewType}
Difficulty (1-5): ${difficulty}
${resumeContext ? `Candidate resume summary for personalization:\n${resumeContext.slice(0, 4000)}` : "No resume provided."}`;

  const parsed = await callLlama(QUESTION_GEN_SYSTEM_PROMPT, userPrompt);
  return Array.isArray(parsed.questions) ? parsed.questions : [];
};

const ANSWER_EVAL_SYSTEM_PROMPT = `You are an expert interviewer grading a candidate's answer to an interview question.

Return ONLY a single valid JSON object (no markdown fences, no commentary) with this exact shape:

{
  "score": <integer 0-100>,
  "feedback": "<2-3 sentence assessment of the answer>",
  "strengths": ["<short strength>", ...1-3 items],
  "improvements": ["<short concrete improvement>", ...1-3 items]
}

Rules:
- Grade strictly based on the question, the reference notes on what a strong answer covers, and the candidate's actual answer.
- Be fair but rigorous - a vague or incomplete answer should not score above 60.
- An empty or clearly irrelevant answer should score 0-10.
- Return ONLY the JSON object, nothing else.`;

export const evaluateInterviewAnswer = async ({ questionPrompt, modelAnswerNotes, userAnswer, targetRole, difficulty }) => {
  const userPrompt = `Target role: ${targetRole}
Difficulty (1-5): ${difficulty}
Question: ${questionPrompt}
What a strong answer should cover: ${modelAnswerNotes || "Use general best judgement for this role and difficulty."}
Candidate's answer: ${userAnswer || "(no answer provided)"}`;

  return callLlama(ANSWER_EVAL_SYSTEM_PROMPT, userPrompt);
};
