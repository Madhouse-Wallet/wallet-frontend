import { paymentApi } from "../../../lib/reapApi";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId, ...paymentData } = req.body;
    console.log("line-10", userId, paymentData);
    const result = await paymentApi.createPayment(paymentData, userId);

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(result.status).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
