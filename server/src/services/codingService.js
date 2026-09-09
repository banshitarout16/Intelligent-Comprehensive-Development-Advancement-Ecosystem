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
      temperature: 0.5,
      max_tokens: 1800,
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

const PROBLEM_GEN_SYSTEM_PROMPT = `You are an expert coding interview problem setter.

Return ONLY a single valid JSON object (no markdown fences, no commentary) with this exact shape:

{
  "title": "<short problem title>",
  "problemStatement": "<full problem description, 2-5 paragraphs, markdown-free plain text>",
  "examples": [
    { "input": "<example input>", "output": "<expected output>", "explanation": "<why>" }
  ],
  "constraints": ["<constraint>", ...2-5 items],
  "starterCode": "<minimal starter code in the requested language, with a function/method signature the candidate should implement, no solution logic>",
  "hints": ["<hint 1, subtle>", "<hint 2, more direct>", "<hint 3, near-solution>"]
}

Rules:
- Generate exactly 2-3 examples.
- Match the requested difficulty (1 = easy/beginner, 5 = hard/expert, interview-caliber).
- If topic is given, the problem must be about that topic/data structure/algorithm.
- starterCode must be valid, compilable/runnable skeleton code in the requested language - a function stub is enough, no full solution.
- For Java, the starter code's public class must be named Main.
- Return ONLY the JSON object, nothing else.`;

export const generateCodingProblem = async ({ topic, difficulty, language }) => {
  const userPrompt = `Language: ${language}
Difficulty (1-5): ${difficulty}
Topic: ${topic || "any common interview topic (arrays, strings, recursion, trees, dynamic programming, etc - pick one)"}`;

  return callLlama(PROBLEM_GEN_SYSTEM_PROMPT, userPrompt);
};

const CODE_REVIEW_SYSTEM_PROMPT = `You are an expert code reviewer grading a candidate's solution to a coding interview problem.

Return ONLY a single valid JSON object (no markdown fences, no commentary) with this exact shape:

{
  "correctness": "correct" | "partially_correct" | "incorrect" | "unknown",
  "score": <integer 0-100>,
  "issues": ["<specific issue with the code>", ...0-5 items],
  "suggestions": ["<concrete improvement>", ...1-5 items],
  "complexityExplanation": "<1-3 sentences on the time and space complexity of the submitted code, and whether that's optimal for this problem>"
}

Rules:
- Judge correctness against the problem statement and examples, not just whether it compiles.
- If stdout/stderr from an actual run is provided, use it as evidence of correctness/bugs.
- Be specific to the submitted code - reference actual variable names or logic when pointing out issues.
- Return ONLY the JSON object, nothing else.`;

export const reviewCodingSubmission = async ({ problemStatement, examples, language, code, stdout, stderr }) => {
  const examplesText = (examples || [])
    .map((e, i) => `Example ${i + 1} - input: ${e.input} | expected output: ${e.output}`)
    .join("\n");

  const userPrompt = `Language: ${language}
Problem statement: ${problemStatement}
${examplesText}

Candidate's code:
${code}

Actual stdout from running the code: ${stdout || "(none)"}
Actual stderr from running the code: ${stderr || "(none)"}`;

  return callLlama(CODE_REVIEW_SYSTEM_PROMPT, userPrompt);
};
