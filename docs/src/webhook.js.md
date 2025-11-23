```javascript
/**
 * @module webhook
 */

import generateDocs from "./docGenerator.js";
import { extractChangedFiles } from "./gitUtils.js";

/**
 * Handles incoming GitHub webhook requests.  Specifically, it processes 'pull_request' events
 * when the action is 'closed' or 'synchronize'.  It extracts changed files from the pull request,
 * and then triggers documentation generation for those files.
 *
 * @async
 * @function webhook
 * @param {object} req - The Express request object.  Expected to contain:
 *   - `req.headers['x-github-event']`: The GitHub event type (e.g., 'pull_request').
 *   - `req.body`: The webhook payload from GitHub, containing details about the event.  Specifically, it requires:
 *     - `req.body.action`: The action associated with the event (e.g., 'closed', 'synchronize').
 *     - `req.body.repository.full_name`: The full name of the repository (e.g., 'owner/repo').
 *     - `req.body.pull_request.number`: The pull request number.
 * @param {object} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the webhook processing is complete.  Sends a response to the client.
 *   - 200 OK: 'Ignored event', 'No action needed', 'No files changed', or 'Docs updated'
 *   - 500 Internal Server Error: 'Error processing webhook' if an error occurs.
 * @throws {Error} - Throws an error if any of the underlying functions fail (e.g., `extractChangedFiles`, `generateDocs`).
 */
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
```