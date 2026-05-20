fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@edunexus.com', password: 'admin123' })
}).then(async r => {
  console.log("Status:", r.status);
  for (const [key, value] of r.headers.entries()) {
    console.log(`Header ${key}: ${value}`);
  }
}).catch(console.error);
