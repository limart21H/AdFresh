import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { apiRouter } from "./server/apiRouter.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json({ limit: "25mb" }));

// Mount API routes
app.use("/api", apiRouter);

// Serve static assets in production
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// Fallback for SPA routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AdForge Server listening on port ${PORT}`);
});
