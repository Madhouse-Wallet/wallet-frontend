// pages/api/getAccount.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Hex, createPublicClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createSmartAccountClient } from "permissionless";
import { toSafeSmartAccount } from "permissionless/accounts";
import { erc7579Actions } from "permissionless/actions/erc7579";
import { entryPoint07Address } from "viem/account-abstraction";
import { EntryPointVersion } from "viem/account-abstraction";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Initialize constants
    console.log("in try")
    const privateKey: Hex =
      (process.env.PRIVATE_KEY as Hex) ??
      (() => {
        const pk = generatePrivateKey();
        return pk;
      })();

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http("https://sepolia.base.org"),
    });
    console.log("Smart Account Client:", publicClient);
    const apiKey = "pim_C2hN8VhSZsDJE3uAY4WFcU";
    const pimlicoUrl = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${apiKey}`;
    console.log("Smart Account Client:", apiKey,pimlicoUrl);

    const pimlicoClient = createPimlicoClient({
      chain: baseSepolia,
      transport: http(pimlicoUrl),
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7" as EntryPointVersion,
      },
    });
    console.log("Smart Account Client:", pimlicoClient);
    // Create a Safe Smart Account
    const account = await toSafeSmartAccount({
      client: publicClient,
      owners: [privateKeyToAccount(privateKey)],
      version: "1.4.1",
    });

    console.log("Smart Account Client:", account);

    const smartAccountClient = createSmartAccountClient({
      account,
      chain: baseSepolia,
      bundlerTransport: http(pimlicoUrl),
      paymaster: pimlicoClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await pimlicoClient.getUserOperationGasPrice()).fast;
        },
      },
    }).extend(erc7579Actions());

    console.log("Smart Account Client:", smartAccountClient);
    console.log(`Smart account address: ${account.address}`);

    // Return the account address as a response
    res.status(200).json({ address: account.address });
  } catch (error) {
    console.error("Error in generating smart account:", error);
    res.status(500).json({ error: "Failed to generate smart account" });
  }
}
