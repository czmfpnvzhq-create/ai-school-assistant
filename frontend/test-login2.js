fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@edunexus.com', password: 'admin123' })
}).then(async r => {
  const text = await r.text();
  const match = text.match(/"message":"([^"]+)"/);
  if (match) {
    console.log("Extracted Error from Next.js HTML:", match[1].replace(/\\n/g, '\n'));
  } else {
    console.log("No error message found in the HTML.");
  }
}).catch(console.error);
