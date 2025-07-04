import type { NextApiRequest, NextApiResponse } from "next";
import { updateLNAddress } from "../../lib/apiCall";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, username } = req.body;

    const resposne = await updateLNAddress({
      email: email,
      newAddress: username,
    });
    if (resposne?.status === "success") {
      return res
        .status(200)
        .json({
          status: "success",
          message: "Address Updated successfully",
          userData: {},
        });
    } else {
      return res
        .status(400)
        .json({
          error: resposne?.message,
          status: "failure",
          message: resposne?.message,
        });
    }
  } catch (error) {
    console.error("Error adding user:", error);
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
