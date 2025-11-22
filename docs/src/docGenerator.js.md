```javascript
/**
 * @file docGenerator.js
 * @description This module automates the generation of documentation for changed code files using an AI service (Google Gemini).
 * It fetches the content of changed files from their raw URLs, sends the code to the AI service to generate documentation,
 * and then saves the generated documentation to markdown files in the `docs` directory.
 */

import fs from "fs";
import path from "path";
import fetch from "node-fetch";

/**
 * @async
 * @function generateDocs
 * @description Generates documentation for a list of changed files.
 * @param {Array<Object>} changedFiles - An array of objects, each representing a changed file. Each object should have `filename` and `raw_url` properties.
 * @returns {Promise<void>} - A promise that resolves when documentation generation is complete for all files.
 *
 * @example
 * // Example usage:
 * const changedFiles = [
 *   { filename: 'src/index.js', raw_url: 'https://example.com/raw/src/index.js' },
 *   { filename: 'src/utils.js', raw_url: 'https://example.com/raw/src/utils.js' },
 * ];
 *
 * await generateDocs(changedFiles);
 */
export default async function generateDocs(changedFiles) {
  const docsDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);

  console.log(
    "📁 Changed files:",
    changedFiles.map((f) => f.filename)
  );

  for (const file of changedFiles) {
    console.log(`📝 Generating doc for: ${file.filename}`);

    const contentResp = await fetch(file.raw_url);
    const code = await contentResp.text();

    const doc = await callAIToGenerateDoc(code, file.filename);

    const docPath = path.join(docsDir, `${file.filename}.md`);
    console.log(`💾 Will save doc to: ${docPath}`);

    const docDir = path.dirname(docPath);
    console.log(`📂 Need directory: ${docDir}`);

    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
      console.log(`✅ Created directory: ${docDir}`);
    }

    fs.writeFileSync(docPath, doc);
    console.log(`✅ Documentation generated: ${docPath}`);
  }
}

/**
 * @async
 * @function callAIToGenerateDoc
 * @description Calls the AI service (Google Gemini) to generate documentation for a given code snippet.
 * @param {string} code - The code snippet to generate documentation for.
 * @param {string} filename - The name of the file the code belongs to.  Used in the prompt to the AI.
 * @returns {Promise<string>} - A promise that resolves with the generated documentation as a string, or an error message if the AI service fails.
 *
 * @throws {Error} - If the AI service returns a non-200 status code or an unexpected response format.
 *
 * @example
 * // Example usage:
 * const code = `function add(a, b) { return a + b; }`;
 * const filename = 'src/math.js';
 * const documentation = await callAIToGenerateDoc(code, filename);
 * console.log(documentation);
 */
async function callAIToGenerateDoc(code, filename) {
  try {
    const prompt = `Generate documentation for the following code file ${filename}: \n\n${code}`;

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
```