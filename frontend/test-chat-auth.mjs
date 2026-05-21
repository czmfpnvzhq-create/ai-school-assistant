/**
 * Smoke test: /api/chat must reject unauthenticated requests.
 * Run: node test-chat-auth.mjs (with `npm run dev` in another terminal)
 */
const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";

async function main() {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Hello" }],
    }),
  });

  if (res.status !== 401) {
    console.error(`FAIL: expected 401, got ${res.status}`);
    process.exit(1);
  }

  const body = await res.json();
  if (!body.error?.toLowerCase().includes("unauthorized")) {
    console.error("FAIL: expected unauthorized error message", body);
    process.exit(1);
  }

  console.log("PASS: /api/chat returns 401 without Authorization header");
}

main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
