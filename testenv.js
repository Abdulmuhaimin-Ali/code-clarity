import "dotenv/config";

console.log(
  "🔑 GitHub Token:",
  process.env.GITHUB_TOKEN
    ? `✅ (length: ${process.env.GITHUB_TOKEN.length})`
    : "❌ MISSING"
);
console.log(
  "🤖 Gemini Key:",
  process.env.GEMINI_API_KEY
    ? `✅ (length: ${process.env.GEMINI_API_KEY.length})`
    : "❌ MISSING"
);
console.log("📁 Current directory:", process.cwd());
