import {
  extractionResultSchema,
  type ExtractionResult,
} from "./extraction-schema";

const EXTRACTION_PROMPT = `You are a course document analyzer. Extract structured information from the following course document text.

Return a JSON object with these fields:
- topics: Array of { label: string, confidence: number (0-1), sourceSpan?: string } — key topics/concepts mentioned
- tasks: Array of { description: string, confidence: number (0-1) } — assignments, homework, or tasks mentioned
- dueDates: Array of { date: string (ISO format if possible), label: string, confidence: number (0-1) } — any dates or deadlines
- coverageStatements: Array of { text: string, mappedTopics: string[], confidence: number (0-1) } — statements about what material is covered

Only return valid JSON. No markdown fences or extra text.

Document text:
`;

export async function extractFromDocument(
  rawText: string,
): Promise<ExtractionResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Add it to your .env file.",
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: EXTRACTION_PROMPT + rawText }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(text);
  const result = extractionResultSchema.parse(parsed);
  return result;
}
