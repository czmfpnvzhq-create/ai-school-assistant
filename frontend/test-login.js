fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@edunexus.com', password: 'admin123' })
}).then(async r => {
  console.log("Status:", r.status);
  console.log("Content-Type:", r.headers.get('content-type'));
  const text = await r.text();
  console.log("Body Snippet:", text.substring(0, 300));
}).catch(console.error);
