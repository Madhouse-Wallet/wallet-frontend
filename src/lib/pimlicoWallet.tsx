import {
  toKernelSmartAccount,
} from "permissionless/accounts";
import { sepolia, baseSepolia } from "viem/chains";
import { Hex, createPublicClient, getContract, http, pad } from "viem";
import {
  entryPoint07Address,
  toWebAuthnAccount,
} from "viem/account-abstraction";
// tBTC SDK Initialization Function
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.drpc.org'),
});
export const getAccount =  async (credentials: any )  => {
  try {
   return await toKernelSmartAccount({
      client: publicClient,
      version: "0.3.1",
      owners: [toWebAuthnAccount({ credential: credentials })],
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    }) 
  } catch (error) {
    console.log("wallet get --->", error);
    return false
  }
}
