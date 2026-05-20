const jwt = require('jsonwebtoken');
const { jwtVerify } = require('jose');

async function test() {
  const secretString = process.env.JWT_SECRET || "fallback_super_secret_key";
  const payload = { id: 1, role: 'ADMIN' };
  
  // Sign with jsonwebtoken
  const token = jwt.sign(payload, secretString, { expiresIn: '7d' });
  console.log("Token:", token);
  
  // Verify with jose
  try {
    const secret = new TextEncoder().encode(secretString);
    const { payload: verified } = await jwtVerify(token, secret);
    console.log("Verified:", verified);
  } catch (error) {
    console.error("Jose verification failed:", error);
  }
}

test();
