import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import webhook from "./src/webhook.js";

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

// GitHub webhook endpoint
app.post("/webhook", webhook);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AI Doc Bot backend running on port ${PORT}`);
});

// adding changes to see what gets triggered
