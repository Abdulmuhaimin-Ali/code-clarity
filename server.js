import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import webhook from "./src/webhook.js";
// import userRoutes from "./src/routes/userRoutes.js";
// import postRoutes from "./src/routes/postRoutes.js";
// import sessionRoutes from "./src/routes/sessionRoutes.js";

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

// GitHub webhook endpoint
app.post("/webhook", webhook);

// // API endpoints for Prisma models
// app.use("/users", userRoutes);
// app.use("/posts", postRoutes);
// app.use("/sessions", sessionRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AI Doc Bot backend running on port ${PORT}`);
});

// adding changes to see what gets triggered
