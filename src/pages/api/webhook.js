export default async function handler(req, res) {
    // 1. Only accept POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // 2. Extract the secret and data from the request
    const { secret, invoice_id, status, amount } = req.body;

    console.log("Body", req.body);

    // 3. Set your expected secret (must match the one you used when creating the invoice)
    const expectedSecret = "webhooksecret"; // Replace this with your real secret

    // 4. Validate the secret
    if (secret !== expectedSecret) {
        return res.status(401).json({ error: "Unauthorized: invalid secret" });
    }

    // 5. Process the webhook payload
    if (status === "paid") {
        // TODO: You can perform whatever you want here
        console.log("Invoice paid:", {
            invoice_id,
            amount,
        });

        // Maybe update your database, notify the user, etc.
    } else {
        console.log("Received non-paid status:", status);
    }

    // 6. Return success
    return res.status(200).json({ success: true });
}