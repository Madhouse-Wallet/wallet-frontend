import { logIn, getUser, createTpos, createUser, createInvoice } from "./lnbit";
import { sendBitcoinn } from "../../lib/apiCall";
import { createLBtcToTbtcShift, createLBtcToUSDCShift } from "./sideShiftAI";
import client from "../../lib/mongodb"; // Import the MongoDB client

const createReverseSwap = async (invoice) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}api/swap/lbtcTobtcSwap`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        status: "error",
        error: data.error || "Failed to create swap",
      };
    }

    return {
      status: "success",
      data: data.data,
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message || "Something went wrong",
    };
  }
};
export default async function handler(req, res) {
  // 1. Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Extract the secret and data from the request
  const { secret, invoice_id, status, amount } = req.body;

  const db = (await client.connect()).db(); // Defaults to the database in the connection string
  const usersCollection = db.collection("users"); // Use 'users' collection
  const user = await usersCollection.findOne({
    "flowTokens.token": secret,
  });
  // Step 2: Extract the matching token object manually
  const matchedToken = user.flowTokens.find((t) => t.token == token);

  if (matchedToken?.flow == 3) {
    try {
      let getToken = await logIn(2);
      if (getToken?.status) {
        let token = getToken?.data?.token;
        // const satoshiAmount = 0.1 * 100000000;
        const satoshiAmount = amount;
        let createInvoice1 = await createInvoice(
          {
            out: false,
            unit: "sat",
            amount: satoshiAmount,
            memo: "invoice",
          },
          token,
          2,
          ""
        );
        if (createInvoice1?.status) {
          let createSwap = await createReverseSwap(
            createInvoice1?.data?.bolt11
          );
          if (createSwap?.status) {
            const result = await sendBitcoinn(
              user?.coinosToken,
              satoshiAmount,
              createSwap?.data?.address
            );
          }
        }
      }
    } catch (error) {
      console.log("error00<", error);
    }
  }

  if (matchedToken?.flow == 2) {
    try {
      const liquidShift = await createLBtcToTbtcShift(
        amount, // amount
        "0x230537f1539E93743dD1a90c945E6086B9c0521a",
        // "0x4974896Cc6D633C7401014d60f27d9f4ac9979Bb",
        process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY,
        process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID
      );
      // liquidShift now contains all the information about the shift, including the deposit address
      const result = await sendBitcoinn(
        user?.coinosToken,
        1,
        liquidShift.depositAddress
      );
    } catch (error) {
      console.log("error-->", error);
    }
  }

  if (matchedToken?.flow == 1) {
    try {
      const liquidShift = await createLBtcToUSDCShift(
        amount, // amount
        "0x230537f1539E93743dD1a90c945E6086B9c0521a",
        // "0x4974896Cc6D633C7401014d60f27d9f4ac9979Bb",
        process.env.NEXT_PUBLIC_SIDESHIFT_SECRET_KEY,
        process.env.NEXT_PUBLIC_SIDESHIFT_AFFILIATE_ID
      );
      // liquidShift now contains all the information about the shift, including the deposit address
      const result = await sendBitcoinn(
        user?.coinosToken,
        1,
        liquidShift.depositAddress
      );
    } catch (error) {
      console.log("error-->", error);
    }
  }

  // 3. Set your expected secret (must match the one you used when creating the invoice)
  const expectedSecret = "webhooksecret"; // Replace this with your real secret

  // 4. Validate the secret
  if (secret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized: invalid secret" });
  }

  // 5. Process the webhook payload
  if (status === "paid") {
    // TODO: You can perform whatever you want here
    console.log("Invoice paid:", {
      invoice_id,
      amount,
    });

    // Maybe update your database, notify the user, etc.
  } else {
    console.log("Received non-paid status:", status);
  }

  // 6. Return success
  return res.status(200).json({ success: true });
}
