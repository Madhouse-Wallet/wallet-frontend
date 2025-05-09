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
    const { email } = req.body;
    const db = (await client.connect()).db(); // Defaults to the database in the connection string
    const usersCollection = db.collection("users"); // Use 'users' collection
    const delusersCollection = db.collection("delusers");
    const existingUser = await usersCollection.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (existingUser) {
      const result = await delusersCollection.insertOne({
        email: existingUser?.email || "",
        userId: existingUser?._id || "",
        passkey_number: existingUser?.passkey_number || "",
        passkey_status: existingUser?.passkey_status || "",
        passkey: existingUser?.passkey || "",
        wallet: existingUser?.wallet || "",
        createdAt: new Date(),
      });

      await usersCollection.deleteOne({ email });
      return res
        .status(200)
        .json({
          status: "success",
          message: "User Deleted successfully",
          userId: existingUser,
        });
    } else {
      return res
        .status(400)
        .json({ status: "failure", message: "No User Found!" });
    }
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
