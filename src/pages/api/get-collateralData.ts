import type { NextApiRequest, NextApiResponse } from "next";
import client from "../../lib/mongodb"; // Import the MongoDB client

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const db = (await client.connect()).db(); // Defaults to the database in the connection string
    const collateralDataCollection = db.collection("collateralData"); // Use 'users' collection

    const existingUser = await collateralDataCollection.findOne();
    if (existingUser) {
      return res
        .status(200)
        .json({
          status: "success",
          message: "User fetched successfully",
          collateralData: existingUser,
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
