const SYSTEM_PROMPT = `You are an expert technical recruiter and ATS (Applicant Tracking System) analyst.
You will be given the raw extracted text of a candidate's resume.

Analyze it and return ONLY a single valid JSON object (no markdown fences, no commentary, no preamble) with this exact shape:

{
  "atsScore": <integer 0-100, overall ATS-friendliness and quality score>,
  "scoreBreakdown": {
    "formatting": <integer 0-100>,
    "keywords": <integer 0-100>,
    "impact": <integer 0-100>,
    "clarity": <integer 0-100>
  },
  "summary": "<2-3 sentence overall assessment>",
  "extractedSkills": ["<skill>", ...up to 20],
  "strengths": ["<short strength>", ...2-5 items],
  "roleRecommendations": [
    { "role": "<job title>", "matchPercent": <integer 0-100>, "reason": "<one sentence>" }
    ... 3-5 items, ordered by matchPercent descending
  ],
  "skillGaps": [
    { "skill": "<missing or weak skill for their target roles>", "importance": "low|medium|high", "note": "<one sentence>" }
    ... 3-6 items
  ],
  "improvementSuggestions": ["<concrete, actionable suggestion>", ...4-8 items]
}

Rules:
- Base every field strictly on the resume text provided. Do not invent employers, dates, or credentials.
- atsScore and the breakdown scores must be integers.
- Keep suggestions concrete and specific to this resume (avoid generic advice).
- Return ONLY the JSON object, nothing else.`;

export const analyzeResumeWithLlama = async (resumeText) => {
  const apiUrl = process.env.LLAMA_API_URL;
  const apiKey = process.env.LLAMA_API_KEY;
  const model = process.env.LLAMA_MODEL || "llama-3.3-70b-versatile";

  if (!apiUrl || !apiKey) {
    throw new Error("Llama API is not configured. Set LLAMA_API_URL and LLAMA_API_KEY in .env");
  }

  const trimmedText = resumeText.slice(0, 12000);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 1800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Resume text:\n\n${trimmedText}` },
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

  return parseAnalysisJson(rawContent);
};

const parseAnalysisJson = (rawContent) => {
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
