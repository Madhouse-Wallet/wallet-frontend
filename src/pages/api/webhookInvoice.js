export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.query;
  const eventData = req.body;

  try {
    console.log(`Webhook triggered for email: ${email}`);
    console.log("Received event data:", eventData);

    // TODO: Save to DB, send notification, etc.

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
