```markdown
# `docGenerator.js`

## Overview

This module, `docGenerator.js`, automates the process of generating documentation for changed code files. It leverages an AI service (Google Gemini) to analyze code and produce corresponding documentation. The generated documentation is then saved as markdown files within the `docs` directory.

## Functionality

1.  **Fetches Code:**  Retrieves the content of modified files from their raw URLs.
2.  **AI-Powered Documentation:**  Sends the fetched code to the AI service (Google Gemini) to generate comprehensive documentation.
3.  **Markdown Generation:** Saves the generated documentation as markdown files in the `docs` directory.  The file name mirrors the original file location for easy reference.
4.  **Directory Creation:** Creates any necessary subdirectories within the `docs` directory to match the original file's directory structure.
5.  **Error Handling:** Gracefully handles potential errors from the AI service and logs them. If the AI service fails, a default error markdown is generated in the documentation file indicating that the process has failed.

## Functions

### `generateDocs(changedFiles)`

This asynchronous function orchestrates the documentation generation process for a list of changed files.

**Parameters:**

*   `changedFiles`: `Array<Object>` - An array of objects, where each object represents a changed file. Each object is expected to have the following properties:
    *   `filename`: `string` - The name of the file (e.g., `src/index.js`).
    *   `raw_url`: `string` - The raw URL of the file (e.g., `https://example.com/raw/src/index.js`).

**Returns:**

*   `Promise<void>` - A promise that resolves when documentation generation is complete for all files in the `changedFiles` array.

**Example:**

```javascript
const changedFiles = [
  { filename: 'src/index.js', raw_url: 'https://example.com/raw/src/index.js' },
  { filename: 'src/utils.js', raw_url: 'https://example.com/raw/src/utils.js' },
];

await generateDocs(changedFiles);
```

**Process:**

1.  **Directory Setup:** Checks if the `docs` directory exists and creates it if it doesn't.
2.  **File Iteration:** Iterates through each file in the `changedFiles` array.
3.  **Code Fetching:**  Fetches the content of the file from its `raw_url`.
4.  **AI Call:** Calls the `callAIToGenerateDoc` function to generate documentation for the fetched code.
5.  **File Path Determination:** Constructs the path for the generated markdown file in the `docs` directory, mirroring the original file's location.
6.  **Directory Creation:**  Creates any necessary directories leading up to the markdown file.
7.  **File Writing:** Writes the generated documentation to the markdown file.
8.  **Logging:** Logs the progress of each step to the console.

### `callAIToGenerateDoc(code, filename)`

This asynchronous function interacts with the Google Gemini AI service to generate documentation for a given code snippet.

**Parameters:**

*   `code`: `string` - The code snippet to generate documentation for.
*   `filename`: `string` - The name of the file that the code belongs to. This is used in the prompt given to the AI, providing context.

**Returns:**

*   `Promise<string>` - A promise that resolves with the generated documentation as a string.  If the AI service encounters an error, a default error markdown will be generated.

**Throws:**

*   `Error` - If the AI service returns a non-200 status code or an unexpected response format.

**Example:**

```javascript
const code = `function add(a, b) { return a + b; }`;
const filename = 'src/math.js';
const documentation = await callAIToGenerateDoc(code, filename);
console.log(documentation);
```

**Process:**

1.  **Prompt Creation:** Constructs a prompt for the AI service, including the filename and the code snippet.
2.  **API Call:** Sends a POST request to the Google Gemini API endpoint with the prompt.  It requires the `GEMINI_API_KEY` environment variable to be set for authentication.
3.  **Response Handling:**
    *   If the response status is not 200 (OK), throws an error.
    *   Parses the JSON response.
    *   Extracts the generated documentation from the response.  It expects the response to have the following structure: `data.candidates[0].content.parts[0].text`.
    *   If the response format is unexpected, throws an error.
4.  **Error Handling:**  If any error occurs during the process (e.g., network error, API error), catches the error, logs it, and returns a default error markdown.
