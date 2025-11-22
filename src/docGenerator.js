import fs from "fs";
import path from "path";
import fetch from "node-fetch";

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
