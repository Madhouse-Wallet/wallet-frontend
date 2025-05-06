export default async function handler(req, res) {
  try {
    const response = await fetch("https://sideshift.ai/static/js/main.js");
    if (!response.ok) {
      throw new Error(`Failed to load script: ${response.statusText}`);
    }

    const scriptText = await response.text();
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.status(200).send(scriptText);
  } catch (error) {
    console.error("Error fetching SideShift script:", error);
    res.status(500).send("// Error loading SideShift script");
  }
}
