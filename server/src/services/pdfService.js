import fs from "fs/promises";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export const extractTextFromPdf = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);

  const text = (data.text || "").replace(/\s+\n/g, "\n").trim();

  if (!text || text.length < 30) {
    throw new Error(
      "Couldn't extract readable text from this PDF. It may be a scanned image rather than a text-based PDF."
    );
  }

  return { text, numPages: data.numpages };
};
