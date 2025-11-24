import fs from "fs";
import path from "path";

export async function generateArchitectureDiagram(repo, overviewContent) {
  const prompt = `Based on this repository overview, create a comprehensive architecture diagram:

Repository: ${repo}

Overview Content:
${overviewContent}

Generate a Mermaid.js flowchart that visualizes:
1. The main architectural components and layers
2. Data flow and communication between components
3. Key services, modules, and their relationships
4. External dependencies, APIs, and databases
5. Entry points and major data pathways

Make it a high-level system architecture diagram that gives a clear big-picture view.

Return ONLY the Mermaid.js code without any explanations or markdown formatting.`;

  try {
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
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]) {
      const mermaidCode = data.candidates[0].content.parts[0].text.trim();

      // Clean up any markdown code fences if they exist
      const cleanedCode = mermaidCode
        .replace(/```mermaid\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Save to docs/ARCHITECTURE.md
      const architecturePath = path.join(
        process.cwd(),
        "docs",
        "ARCHITECTURE.md"
      );
      const content = `# Architecture Diagram\n\n\`\`\`mermaid\n${cleanedCode}\n\`\`\`\n`;
      fs.writeFileSync(architecturePath, content);

      console.log(" Architecture diagram saved to docs/ARCHITECTURE.md");
      return cleanedCode;
    } else {
      throw new Error("Unexpected response format from Gemini");
    }
  } catch (error) {
    console.warn("Failed to generate architecture diagram:", error.message);
    return null;
  }
}

// Example usage - call this after generating the overview
export async function generateArchitectureFromOverview(repo) {
  try {
    // Read the overview file
    const overviewPath = path.join(process.cwd(), "docs", "OVERVIEW.md");
    const overviewContent = fs.readFileSync(overviewPath, "utf8");

    // Generate architecture diagram
    await generateArchitectureDiagram(repo, overviewContent);
  } catch (error) {
    console.error("Error generating architecture:", error.message);
  }
}
