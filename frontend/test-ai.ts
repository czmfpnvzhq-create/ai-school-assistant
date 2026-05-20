import "dotenv/config";
import { askAI, parseAIResponse } from "./src/lib/ai/huggingface";
import { getSystemPrompt } from "./src/lib/prompts/system";

async function runTest() {
  console.log("--------------------------------------------------");
  console.log("🤖 STARTING LIVE AI SERVICE VERIFICATION TEST...");
  console.log("--------------------------------------------------");
  
  const systemPrompt = getSystemPrompt("2026-05-19");
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Show me the students in Class 6" }
  ];

  console.log("\n✉️ Formatting prompt and sending messages to Mistral-7B-Instruct-v0.3...");
  
  try {
    const rawResponse = await askAI(messages);
    console.log(`\n📥 Raw AI Response:\n"${rawResponse}"`);
    console.log("--------------------------------------------------");

    const parsed = parseAIResponse(rawResponse);
    console.log("🔍 Parsed Action Response Payload:");
    console.log(JSON.stringify(parsed, null, 2));
    console.log("--------------------------------------------------");

    if (parsed.action === "tool_call" && parsed.tool === "get_students_by_class") {
      console.log("✅ SUCCESS! The Hugging Face model successfully executed a get_students_by_class tool call!");
    } else {
      console.log("⚠️ The model replied directly or formatted the payload differently. Verify raw output above.");
    }
  } catch (error) {
    console.error("❌ Live AI Service test failed with error:", error);
  }
}

runTest();
