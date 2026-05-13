/**
 * Streams via local Express proxy → NVIDIA NIM API.
 * The proxy lives at server.js and runs on port 3001.
 */
export async function streamAgent(piece, idea, onChunk, onDone) {
  const endpoint = "http://localhost:3001/api/chat";

  const body = {
    model: "deepseek-ai/deepseek-v4-flash",
    max_tokens: 1200,
    stream: true,
    messages: [
      { role: "system", content: piece.prompt },
      {
        role: "user",
        content: `Project idea: "${idea}"\n\nProvide your expert analysis.`,
      },
    ],
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      onDone(`❌ Proxy error ${res.status}: ${err}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.choices?.[0]?.delta?.content;
          if (text) {
            full += text;
            onChunk(full);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    onDone(full || "_(No output generated)_");
  } catch (e) {
    onDone(`❌ Error: ${e.message}`);
  }
}
