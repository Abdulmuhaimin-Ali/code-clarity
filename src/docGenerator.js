import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export default async function generateDocs(changedFiles) {
  const docsBaseDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(docsBaseDir)) fs.mkdirSync(docsBaseDir);

  console.log(
    "📁 Changed files:",
    changedFiles.map((f) => f.filename)
  );

  for (const file of changedFiles) {
    const contentResp = await fetch(file.raw_url);
    const code = await contentResp.text();

    // get category from AI
    const category = await categorizeFile(code, file.filename);

    const doc = await callAIToGenerateDoc(code, file.filename);

    // Create organized file structure
    const docPath = path.join(docsBaseDir, category, `${file.filename}.md`);

    const docDir = path.dirname(docPath);

    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
      console.log(`✅ Created directory: ${docDir}`);
    }

    fs.writeFileSync(docPath, doc);
    console.log(`✅ Documentation generated: ${docPath}`);
  }
}

async function categorizeFile(code, filename) {
  try {
    const prompt = `
  Analyze this code file and categorize it:
  
  File: ${filename}
  code:
  ${code}
  
  Categorize this into one of these categories:
   - business-logic
   - api-routes
   - database
   
   Return ONLY the category name, nothing else.
   `;

    const response = await fetch(process.env.GEMINI_API_Endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error("Unexpected response format from Gemini");
    }
  } catch (error) {
    console.error("Error categorizing file:", error);
    return "uncategorized";
  }
}

// Helper function to call AI service
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


// demo