import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default async function generateDocs(changedFiles) {
  const docsBaseDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(docsBaseDir)) fs.mkdirSync(docsBaseDir);

  console.log(
    " Changed files:",
    changedFiles.map((f) => f.filename)
  );

  for (const file of changedFiles) {
    const contentResp = await fetch(file.raw_url);
    const code = await contentResp.text();

    // get category from AI
    const category = await categorizeFile(code, file.filename);
    console.log(`Categorized ${file.filename} as ${category}`);

    const doc = await callAIToGenerateDoc(code, file.filename);

    // Create organized file structure
    const docPath = path.join(docsBaseDir, category, `${file.filename}.md`);

    const docDir = path.dirname(docPath);

    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
      console.log(` Created directory: ${docDir}`);
    }

    fs.writeFileSync(docPath, doc);
    console.log(`  Documentation generated: ${docPath}`);
  }
}

async function categorizeFile(code, filename) {
  try {
    const prompt = `You must return ONLY a single word from this exact list:
- business-logic
- api-routes
- database

File: ${filename}
Code:
${code}

Return ONLY the category word. Do not include any other text, explanation, or punctuation.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 20,
          },
        }),
      }
    );

    const data = await response.json();
    const rawCategory = data.candidates[0].content.parts[0].text;
    console.log("Raw AI response:", rawCategory);

    // Clean up the response aggressively
    const category = rawCategory
      .trim()
      .toLowerCase()
      .replace(/[^a-z-]/g, "") // Remove everything except letters and hyphens
      .split("\n")[0]; // Take only first line if multiple

    // Validate against allowed categories
    const validCategories = ["business-logic", "api-routes", "database"];
    if (!validCategories.includes(category)) {
      console.warn(
        `Invalid category "${category}", defaulting to uncategorized`
      );
      return "uncategorized";
    }
    return category;
  } catch (error) {
    console.error("Error categorizing file:", error);
    return "uncategorized";
  }
}

// Helper function to call AI service
async function callAIToGenerateDoc(code, filename, category) {
  try {
    const prompt = `
Generate comprehensive documentation for this ${category} file: ${filename}

Code:
${code}

Please provide:
## Purpose & Overview
## Key Functions/Components
## Business Logic (if applicable)
## Input/Output Specifications
## Usage Examples
## Dependencies
## Important Notes

Format in clear markdown with appropriate headers.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI service responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response format from Gemini");
    }
  } catch (error) {
    console.error("Error calling AI service:", error);
    return `# Documentation Generation Failed\n\nError: ${error.message}`;
  }
}

// demo
// demo
// demo
// demo
// demo
