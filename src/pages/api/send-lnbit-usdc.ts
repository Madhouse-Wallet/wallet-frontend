import type { NextApiRequest, NextApiResponse } from "next";
import {
  logIn,
  createSwapReverse,
  payInvoice,
  createUser,
  createBlotzAutoReverseSwap,
  userLogIn,
} from "./lnbit";
import { createLbtcToUsdcShiftWithdraw } from "./sideShiftAI";
import { createReverseSwap, createReverseSwapSocket } from "./boltzSocket";
import { lambdaInvokeFunction } from "@/lib/apiCall";

const getDestinationAddress = async (
  walletAddress: any,
  amount: any,
  boltzSwapId: any
) => {
  try {
    const shift = (await createLbtcToUsdcShiftWithdraw(
      amount,
      walletAddress,
      process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY!,
      process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID!,
      process.env.NEXT_PUBLIC_REFUND_ADDRESS!,
      boltzSwapId
    )) as any;

    console.log("shift--> response", shift);
    return {
      status: true,
      shift,
      depositAddress: shift.depositAddress,
      settleAmount: parseFloat(shift.settleAmount || 0),
    };
  } catch (error: any) {
    console.log(error?.message || "Failed to get the quotes");
    return {
      status: false,
      message: error?.message || "Failed to get the quotes",
    };
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
    const {
      email = "",
      wallet = "",
      amount,
      lnbitId_3,
      lnbitWalletId_3,
      lnbitAdminKey_3 = "",
    } = req.body;

    console.log("req.body -->", req.body);

    const sats = amount;
    
    const liquidBTCNetworkFee = Number(
      process.env.NEXT_PUBLIC_LIQUID_BTC_NETWORK_FEE
    ); //200 sats is the averave fee for a Liquid transaction settlements

    const minSwap = Number(process.env.NEXT_PUBLIC_MIN_USDC_SWAP_SATS);
    const maxSwap = Number(process.env.NEXT_PUBLIC_MAX_USDC_SWAP_SATS);

    if (sats > maxSwap || sats < minSwap) {
      return res
        .status(400)
        .json({ status: "failure", message: "Insufficient Balance" });
    }

    let invoice_amount = Math.floor(sats);
    console.log("invoice_amount-->", invoice_amount);

    let getUserToken = (await userLogIn(2, lnbitId_3)) as any;
    let token = getUserToken?.data?.token as any;

    let createBoltzSwapApi = await createReverseSwap(invoice_amount);

    if (!createBoltzSwapApi?.status)
      return res
        .status(400)
        .json({
          status: "failure",
          message: "error creating swap : " + createBoltzSwapApi.message,
        });

    const shift_amount =
      parseInt(createBoltzSwapApi.data.onchainAmount) - liquidBTCNetworkFee;
    console.log("shift_amount-->", shift_amount);

    const finalRoute = await getDestinationAddress(
      wallet,
      shift_amount / 100000000,
      createBoltzSwapApi.data.id
    );

    if (!finalRoute?.status)
      return res
        .status(400)
        .json({
          status: "failure",
          message: "error during final route : " + finalRoute.message,
        });

    const shiftRouteAdd = await lambdaInvokeFunction(
      {
        email: email,
        wallet: wallet,
        type: "withdraw usdc shift",
        data: finalRoute.shift,
      },
      "madhouse-backend-production-addSideShiftTrxn"
    );

    console.log("finalRoute-->", finalRoute);

    const swapSocket = await createReverseSwapSocket(
      createBoltzSwapApi.data,
      createBoltzSwapApi.preimage,
      createBoltzSwapApi.keys,
      finalRoute.depositAddress
    );

    console.log("Step 4: Created swap", swapSocket);

    if (!swapSocket?.status)
      return res
        .status(400)
        .json({ status: "failure", message: swapSocket.message });

    const boltzRouteAdd = await lambdaInvokeFunction(
      {
        email: email,
        wallet: wallet,
        type: "withdraw usdc shift",
        data: { ...createBoltzSwapApi.storeData, address: finalRoute.depositAddress }
      },
      "madhouse-backend-production-addBoltzTrxn"
    );

    // pay invoice
    const invoice = await payInvoice(
      { out: true, bolt11: swapSocket.data.invoice },
      token,
      2,
      lnbitAdminKey_3
    );

    console.log("withdraw usdc invoice-->", invoice);
    if (!invoice?.status)
      return res.status(400).json({ status: "failure", message: invoice.msg });

    return res.status(200).json({
      status: "success",
      message: "Successfully Transfered the USDC!",
      data: invoice?.data,
    });
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
