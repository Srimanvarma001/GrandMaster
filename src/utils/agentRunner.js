import { streamMinimax } from "./minimax";
import { streamDeepSeek } from "./deepseek";

export async function streamAgent(piece, prompt, onChunk, onDone) {
  if (piece.provider === "minimax") {
    await streamMinimax(piece, prompt, onChunk, onDone);
  } else if (piece.provider === "deepseek") {
    await streamDeepSeek(piece, prompt, onChunk, onDone);
  } else {
    onDone(`Unknown provider: ${piece.provider}`);
  }
}

export function formatContext(contextMap, maxTokens = 800) {
  const lines = [];
  for (const [name, output] of Object.entries(contextMap)) {
    const trimmed = output.length > 2000 ? output.slice(0, 2000) + "..." : output;
    lines.push(`### ${name}'s Analysis:\n${trimmed}`);
  }
  let context = lines.join("\n\n---\n");

  const estimatedTokens = Math.ceil(context.length / 4);
  if (estimatedTokens > maxTokens) {
    const targetChars = maxTokens * 4;
    context = context.slice(0, targetChars) + "\n\n_(context truncated)_";
  }

  return context;
}
