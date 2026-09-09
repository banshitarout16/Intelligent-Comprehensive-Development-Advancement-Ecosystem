const SYSTEM_PROMPT = `You are the PrepVerse AI Career Assistant - a knowledgeable, encouraging career coach and technical mentor embedded in a job-prep platform.

You help with:
- Career questions (job search strategy, resumes, negotiation, career paths)
- Explaining interview questions and concepts
- Explaining why a previous interview answer scored the way it did, and how to improve it
- General technical and behavioral interview coaching

Keep answers concise and actionable (usually 2-6 short paragraphs or a short list). Use the conversation history and any provided context to give specific, relevant answers rather than generic advice. If context about a specific interview question or resume is provided, ground your answer in it directly.`;

export const sendChatMessage = async ({ history, contextNote }) => {
  const apiUrl = process.env.LLAMA_API_URL;
  const apiKey = process.env.LLAMA_API_KEY;
  const model = process.env.LLAMA_MODEL || "llama-3.3-70b-versatile";

  if (!apiUrl || !apiKey) {
    throw new Error("Llama API is not configured. Set LLAMA_API_URL and LLAMA_API_KEY in .env");
  }

  const messages = [{ role: "system", content: SYSTEM_PROMPT }];

  if (contextNote) {
    messages.push({ role: "system", content: `Context for this conversation:\n${contextNote.slice(0, 3000)}` });
  }

  for (const msg of history.slice(-20)) {
    messages.push({ role: msg.role, content: msg.content });
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 900,
      messages,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`Llama API request failed (${response.status}): ${errBody.slice(0, 300)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Llama API returned an empty response");
  }

  return content.trim();
};
