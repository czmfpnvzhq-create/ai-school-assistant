/**
 * Validates Hugging Face token without printing the full secret.
 * Run from frontend/: node scripts/validate-hf-token.mjs
 */
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env.local") });
dotenv.config({ path: join(__dirname, "..", ".env") });

function cleanKey(raw) {
  if (!raw) return "";
  return raw.trim().replace(/^["']|["']$/g, "").trim();
}

const key = cleanKey(process.env.HUGGINGFACE_API_KEY);

console.log("--- Hugging Face token check ---");
if (!key) {
  console.error("FAIL: HUGGINGFACE_API_KEY is missing in .env.local");
  process.exit(1);
}
if (!key.startsWith("hf_")) {
  console.error("FAIL: Token must start with hf_");
  process.exit(1);
}
console.log(`OK: Token present (${key.length} chars, prefix ${key.slice(0, 7)}...)`);

const client = new InferenceClient(key);

const attempts = [
  { model: "Qwen/Qwen2.5-7B-Instruct", provider: undefined },
  { model: "Qwen/Qwen2.5-7B-Instruct", provider: "hf-inference" },
];

let lastMsg = "";
for (const { model, provider } of attempts) {
  try {
    const res = await client.chatCompletion({
      model,
      ...(provider ? { provider } : {}),
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
      max_tokens: 10,
    });
    console.log("SUCCESS: Inference API accepted your token.");
    console.log("Sample:", res.choices[0]?.message?.content?.trim());
    process.exit(0);
  } catch (e) {
    lastMsg = e.message || String(e);
    console.error(`FAIL (${provider ?? "auto"}):`, lastMsg);
  }
}

const lower = lastMsg.toLowerCase();
if (
  lower.includes("invalid username or password") ||
  lower.includes("invalid credentials") ||
  lower.includes("expired")
) {
  console.error("\nYour Hugging Face token is invalid, expired, or revoked.");
}
console.error("\nFix:");
console.error("1. https://huggingface.co/settings/tokens → Create NEW token");
console.error("2. Fine-grained → enable “Make calls to Inference Providers”");
console.error("3. frontend/.env.local → HUGGINGFACE_API_KEY=hf_xxx  (no quotes)");
console.error("4. Delete or update the duplicate key in frontend/.env if present");
console.error("5. Restart: npm run dev");
process.exit(1);
