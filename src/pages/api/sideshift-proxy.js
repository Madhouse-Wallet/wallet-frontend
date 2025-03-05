// export default async function handler(req, res) {
//   try {
//     const response = await fetch("https://sideshift.ai/static/js/main.js");
//     if (!response.ok) {
//       throw new Error(`Failed to load script: ${response.statusText}`);
//     }

//     const scriptText = await response.text();
//     res.setHeader("Content-Type", "application/javascript");
//     res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
//     res.status(200).send(scriptText);
//   } catch (error) {
//     console.error("Error fetching SideShift script:", error);
//     res.status(500).send("// Error loading SideShift script");
//   }
// }


export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const response = await fetch("https://sideshift.ai/static/js/main.js", {
      method: 'GET',
      headers: {
        'User-Agent': 'NextJS SideShift Proxy',
        'Referer': 'https://your-domain.com'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const scriptText = await response.text();
    
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    res.status(200).send(scriptText);
  } catch (error) {
    console.error("SideShift script proxy error:", error);
    res.status(500).send(`// Proxy error: ${error.message}`);
  }
}