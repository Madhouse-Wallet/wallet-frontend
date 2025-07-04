import type { NextApiRequest, NextApiResponse } from "next";
import {
  logIn,
  createSwapReverse,
  payInvoice,
  createUser,
  createBlotzAutoReverseSwap,
  userLogIn,
} from "./lnbit";
import { createLbtcToUsdcShift } from "./sideShiftAI";
import { reverseSwap } from "./botlzFee";
const getDestinationAddress = async (walletAddress: any, amount: any) => {
  try {
    const shift = await createLbtcToUsdcShift(amount, walletAddress, process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY!, process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID!) as any;
    console.log("shift--> response", shift)
    return {
      status: true,
      depositAddress: shift.depositAddress,
      settleAmount: parseFloat(shift.settleAmount || 0),
    };
  } catch (error: any) {
    console.log(error?.message || "Failed to get the quotes");
    return { status: false, message: error?.message || "Failed to get the quotes" };
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { wallet = "", amount, lnbitId_3, lnbitWalletId_3, lnbitAdminKey_3 = "" } = req.body;
    // const getToken = (await logIn(2)) as any;
    // let token = getToken?.data?.token;
    let getUserToken = (await userLogIn(2, lnbitId_3)) as any;
    let token = getUserToken?.data?.token as any;
    // const satoshiAmount = amount * 100000000;
    const satoshiAmount = amount;
    let calculateOnChainAmount = await reverseSwap(satoshiAmount, "L-BTC") as any;
    console.log("calculateOnChainAmount-->", calculateOnChainAmount)

    const finalRoute = await getDestinationAddress(wallet, (calculateOnChainAmount.onchainAmount / 100000000));
    if (!finalRoute?.status) return res.status(400).json({ status: "failure", message: ("error during final route : " + finalRoute.message) });



    let data = (await createSwapReverse(
      {
        wallet: lnbitWalletId_3,
        asset: "L-BTC/BTC",
        amount: satoshiAmount,
        direction: "send",
        instant_settlement: true,
        onchain_address: finalRoute.depositAddress,
        feerate: true,
        feerate_value: 0
      },
      token,
      2
    )) as any;
    console.log("data", data);
    if (data?.status) {
      const payInv = (await payInvoice(
        {
          out: true,
          bolt11: data?.data?.invoice, // ← invoice from above
        },
        token,
        2,
        lnbitAdminKey_3
      )) as any;
      if (payInv?.status) {
        return res.status(200).json({
          status: "success",
          message: "Withdraw Done!",
          data: payInv?.data,
        });
      } else {
        return res.status(400).json({ status: "failure", message: data.msg });
      }
    } else {
      return res.status(400).json({ status: "failure", message: data.msg });
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
