import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "NVIDIA_API_KEY not set in .env" });
  }

  try {
    const upstream = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(req.body),
      }
    );

    // Stream the response straight through
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // In server.js, after the upstream fetch, add before the pipe:
console.log("Status:", upstream.status);
upstream.body.on('data', chunk => console.log("RAW:", chunk.toString()));
upstream.body.pipe(res);

   
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running at http://localhost:${PORT}`);
});
