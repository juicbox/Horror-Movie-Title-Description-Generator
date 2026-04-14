import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/anthropic/messages", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "Missing ANTHROPIC_API_KEY. Create a .env file with ANTHROPIC_API_KEY=YOUR_KEY",
    });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body ?? {}),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("content-type", "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ error: String(e?.message ?? e) });
  }
});

const port = Number(process.env.API_PORT ?? 5174);
app.listen(port, () => {
  console.log(`[api] listening on http://127.0.0.1:${port}`);
});

