import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env.local") });
dotenv.config({ path: join(__dirname, "..", ".env") });

const key = (process.env.HUGGINGFACE_API_KEY || "")
  .trim()
  .replace(/^["']|["']$/g, "")
  .trim();
const client = new InferenceClient(key);

const models = [
  "Qwen/Qwen2.5-7B-Instruct",
  "meta-llama/Llama-3.2-3B-Instruct",
  "HuggingFaceH4/zephyr-7b-beta",
];

for (const model of models) {
  for (const provider of [undefined, "hf-inference", "together"]) {
    const label = provider ?? "(auto)";
    try {
      const res = await client.chatCompletion({
        model,
        ...(provider ? { provider } : {}),
        messages: [{ role: "user", content: "Reply OK only" }],
        max_tokens: 8,
      });
      console.log(`OK ${model} @ ${label}:`, res.choices[0]?.message?.content);
    } catch (e) {
      console.log(`FAIL ${model} @ ${label}:`, e.message?.slice(0, 120));
    }
  }
}
