import { partiesApi } from "../../../lib/reapApi";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId, ...partyData } = req.body;
    const result = await partiesApi.createParty(partyData, userId);

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(result.status).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
