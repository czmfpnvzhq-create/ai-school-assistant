/**
 * Normalizes HUGGINGFACE_API_KEY from env (strips quotes/whitespace).
 */
export function getHfApiKey(): string | undefined {
  const raw = process.env.HUGGINGFACE_API_KEY;
  if (!raw) return undefined;

  const cleaned = raw.trim().replace(/^["']|["']$/g, "").trim();
  if (!cleaned || cleaned.includes("YOUR_TOKEN") || cleaned.includes("xxx")) {
    return undefined;
  }
  if (!cleaned.startsWith("hf_")) {
    return undefined;
  }
  return cleaned;
}

export function assertHfApiKey(): string {
  const key = getHfApiKey();
  if (!key) {
    throw new Error(
      "Hugging Face API key is missing or invalid. Create a token at https://huggingface.co/settings/tokens (enable Inference), set HUGGINGFACE_API_KEY=hf_xxx in frontend/.env.local without quotes, then restart npm run dev."
    );
  }
  return key;
}
