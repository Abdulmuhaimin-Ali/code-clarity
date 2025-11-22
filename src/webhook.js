import generateDocs from "./docGenerator.js";
import { extractChangedFiles } from "./gitUtils.js";

export default async function webhook(req, res) {
  const event = req.headers["x-github-event"];

  if (event !== "pull_request") {
    return res.status(200).send("Ignored event");
  }
  // Only handle 'closed' and 'synchronize' actions
  const action = req.body.action;
  if (action !== "closed" && action !== "synchronize") {
    return res.status(200).send("No action needed");
  }

  const repoInfo = {
    repo: req.body.repository.full_name,
    prNumber: req.body.pull_request.number,
  };

  try {
    const changedFiles = await extractChangedFiles(repoInfo);

    // Check if there are any files to process
    if (changedFiles.length === 0) {
      return res.status(200).send("No files changed");
    }

    await generateDocs(changedFiles);
    res.status(200).send("Docs updated");
  } catch (error) {
    console.error("Webhook processing failed:", error);
    res.status(500).send("Error processing webhook");
  }
}
