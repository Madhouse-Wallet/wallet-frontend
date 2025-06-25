import { businessAccountApi } from "../../../lib/reapApi";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const result = await businessAccountApi.createBusinessAccount(req.body);

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      console.log("line-14", result);
      res.status(result.status).json({ error: result.error });
    }
  } catch (error) {
    console.log("line-17", error);
    res.status(500).json({ error: error.message });
  }
}
