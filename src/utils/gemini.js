/**
 * Streams a response from Google Gemini API.
 * Uses the generateContent endpoint with streaming.
 *
 * @param {object} piece  - The chess piece agent config
 * @param {string} idea   - The user's project idea
 * @param {function} onChunk  - Called with accumulated text on each chunk
 * @param {function} onDone   - Called with final text when complete
 */
export async function streamGemini(piece, idea, onChunk, onDone) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    onDone("⚠️ No Gemini API key found. Add VITE_GEMINI_API_KEY to your .env file.");
    return;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: piece.prompt }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Project idea: "${idea}"\n\nProvide your expert analysis.`,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 4000,
      temperature: 0.7,
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      onDone(`❌ API error ${res.status}: ${err}`);
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
          const text =
            parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
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
