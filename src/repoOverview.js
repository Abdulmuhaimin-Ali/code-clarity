// Add this to your gitUtils.js or a new file
async function scanRepositoryRecursively(contents, repo, path = "") {
  let allFiles = [];

  for (const item of contents) {
    if (item.type === "file") {
      allFiles.push({
        path: item.path,
        name: item.name,
        download_url: item.download_url,
      });
    } else if (item.type === "dir") {
      // Recursively scan subdirectories
      const subdirUrl = `https://api.github.com/repos/${repo}/contents/${item.path}`;
      const subdirResp = await fetch(subdirUrl, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "User-Agent": "ai-doc-bot",
        },
      });
      const subdirContents = await subdirResp.json();
      const subdirFiles = await scanRepositoryRecursively(
        subdirContents,
        repo,
        item.path
      );
      allFiles = allFiles.concat(subdirFiles);
    }
  }

  return allFiles;
}

export async function generateRepositoryOverview(repo) {
  try {
    const url = `https://api.github.com/repos/${repo}/contents`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "User-Agent": "ai-doc-bot",
      },
    });

    if (!resp.ok) {
      throw new Error(`GitHub API error: ${resp.statusText}`);
    }

    const contents = await resp.json();
    const allFiles = await scanRepositoryRecursively(contents, repo);

    // Generate overview document
    const overview = await generateOverviewDocument(allFiles, repo);

    const overviewPath = path.join(process.cwd(), "docs", "OVERVIEW.md");
    const docsDir = path.dirname(overviewPath);

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    fs.writeFileSync(overviewPath, overview);
    console.log(`✅ Repository overview generated: ${overviewPath}`);

    return allFiles;
  } catch (error) {
    console.error("Error generating repository overview:", error);
    throw error;
  }
}

async function generateOverviewDocument(files, repo) {
  const fileList = files.map((file) => `- \`${file.path}\``).join("\n");

  const prompt = `
Generate a comprehensive repository overview for: ${repo}

Files in repository:
${fileList}

Please provide:
# Repository Overview

## Project Structure
- Explain the overall architecture and folder structure

## Key Components
- Identify main modules and their purposes

## Entry Points
- Main application files and startup scripts

## Dependencies
- What external libraries or services are used

## Development Guide
- How to set up, build, and test the project

Format in clear markdown with proper headings.
`;

  // Use your existing AI call function
  const response = await fetch(process.env.AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return data.output;
}
