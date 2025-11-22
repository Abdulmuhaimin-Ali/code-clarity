import fetch from "node-fetch";

export async function extractChangedFiles({ repo, prNumber }) {
  console.log("GitHub Token exists:", !!process.env.GITHUB_TOKEN); // Add this line

  const url = `https://api.github.com/repos/${repo}/pulls/${prNumber}/files`;

  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "ai-doc-bot",
    },
  });

  const data = await resp.json();
  // Check if it's an error response
  if (!resp.ok) {
    throw new Error(`GitHub API error: ${resp.statusText}`);
  }

  console.log("Extracted changed files:", data);

  // Check if data is actually an array
  if (!Array.isArray(data)) {
    throw new Error(`Expected array of files, got: ${typeof data}`);
  }

  return files.map((f) => ({
    filename: f.filename,
    patch: f.patch,
    status: f.status,
    raw_url: f.raw_url,
  }));
}
