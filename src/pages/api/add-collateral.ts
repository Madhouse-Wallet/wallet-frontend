import type { NextApiRequest, NextApiResponse } from "next";
import client from "../../lib/mongodb"; // Import the MongoDB client

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, email, colleralAmount, borrowAmount, walletAddress } =
      req.body;

    // Validate email
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Invalid email" });
    }

    // Connect to the database
    const db = (await client.connect()).db(); // Defaults to the database in the connection string
    const usersCollection = db.collection("collateral"); // Use 'users' collection

    // Insert the new user
    const result = await usersCollection.insertOne({
      userId,
      email,
      colleralAmount,
      borrowAmount,
      walletAddress,
      createdAt: new Date(),
    });
    return res
      .status(201)
      .json({
        status: "success",
        message: "User added successfully",
        userId: result.insertedId,
      });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "3mb",
    },
  },
};
