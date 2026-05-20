import dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';

dotenv.config();

const apiKey = process.env.HUGGINGFACE_API_KEY;

if (!apiKey || apiKey.includes("hf_YOUR_TOKEN_HERE")) {
  console.error("❌ Error: HUGGINGFACE_API_KEY is missing or invalid in your environment!");
  process.exit(1);
}

const hf = new HfInference(apiKey);

// We will try these highly capable free models that are typically deployed on Hugging Face Serverless Inference
const candidateModels = [
  "Qwen/Qwen2.5-7B-Instruct",
  "meta-llama/Llama-3.2-3B-Instruct",
  "HuggingFaceH4/zephyr-7b-beta"
];

async function runTests() {
  console.log("--------------------------------------------------");
  console.log("⚡ PROBING ACTIVE FREE INFERENCE MODELS...");
  console.log("--------------------------------------------------");

  for (const model of candidateModels) {
    try {
      console.log(`⏳ Probing model: ${model}...`);
      
      const response = await hf.chatCompletion({
        model: model,
        messages: [
          { role: "system", content: "You are a concise school assistant." },
          { role: "user", content: "State 2 key features of an AI school assistant in one short sentence." }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      console.log(`\n✅ SUCCESS! Model "${model}" is ONLINE and active.`);
      console.log("🤖 Response:\n");
      console.log(response.choices[0]?.message?.content);
      console.log("\n--------------------------------------------------");
      console.log(`👉 Perfect! We should use "${model}" for the application.`);
      return model; // Exit early once we find a working one!
    } catch (error) {
      console.log(`❌ Model "${model}" failed: ${error.message || "Not available"}\n`);
    }
  }

  console.error("❌ All candidate models failed to respond. Please verify your token has proper Read scopes.");
  return null;
}

runTests();
