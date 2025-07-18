import type { NextApiRequest, NextApiResponse } from "next";
import { getDeposit, userLogIn } from "./lnbit";
import { lambdaInvokeFunction } from "../../lib/apiCall";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { email } = req.body;
    const apiResponse = (await lambdaInvokeFunction(
      { email },
      "madhouse-backend-production-getUser"
    )) as any;
    if (apiResponse?.status == "success") {
      let existingUser = apiResponse?.data;
      if (existingUser) {
        let getToken = (await userLogIn(2, existingUser?.lnbitId_3)) as any;
        if (getToken?.status) {
          let token = getToken?.data?.token;
          const result = (await getDeposit(
            token,
            2,
            existingUser?.lnbitAdminKey_3
          )) as any;
          if (result.status) {
            return res
              .status(200)
              .json({ status: "success", data: result.data });
          } else {
            return res
              .status(400)
              .json({ status: "failure", message: result.msg });
          }
        } else {
          return res
            .status(400)
            .json({ status: "failure", message: getToken.msg });
        }
      }
    } else {
      return res.status(400).json({
        status: "failure",
        message: apiResponse?.message,
        error: apiResponse?.error,
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
