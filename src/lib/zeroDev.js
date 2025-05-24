"use client";
import { zeroAddress, parseAbi,getAddress,createPublicClient, http } from "viem";
import { entryPoint07Address } from "viem/account-abstraction"
import { toSimple7702SmartAccount } from "viem/account-abstraction";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createSmartAccountClient } from "permissionless";

import { ethers, maxUint256  } from "ethers";
import { base } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {EIP1193Provider} from "./EIP1193Provider";
export const BUNDLER_URL = 'https://api.pimlico.io/v2/8453/rpc?apikey=pim_gCvmGFU2NgG2xZcmjKVNsE';
export const usdc = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const CHAIN = base;

const paymasterClient = createPimlicoClient({
    transport: http(BUNDLER_URL),
    chain: CHAIN,
      entryPoint: {
      address: entryPoint07Address,
      version: "0.7"
    },
  });

const publicClient = createPublicClient({
  transport: http(),
  chain: CHAIN,
});

export const zeroTrxn = async (kernelClient,signer) => {
  try {
    const txnHash = await kernelClient.sendTransaction({
		to: zeroAddress,
		value: BigInt(0),
		data: "0x",
		authorization: await signer.signAuthorization({
      account: signer,
      address: '0xe6Cae83BdE06E4c305530e199D7217f42808555B',
			chainId: CHAIN.id,
			nonce: await publicClient.getTransactionCount({
				address: signer.address,
			}),
		}),
	}); 
    const { receipt } = await kernelClient.waitForUserOperationReceipt({
    hash: txnHash,
  });
    return {
      status: true,
      data: receipt,
    };
  } catch (error) {
    console.log(" zeroTrxn error-->", error);
    return {
      status: false,
      msg: error?.message,
    };
  }
};
export const getPrivateKey = async () => {
  try {
    const PRIVATE_KEY = generatePrivateKey();
    return PRIVATE_KEY;
  } catch (error) {
    return false;
  }
};

export const checkPrivateKey = async (PRIVATE_KEY) => {
  try {
    const signer = privateKeyToAccount(PRIVATE_KEY);
    return {
      status: true,
      signer,
    };
  } catch (error) {
    console.log("error-->", error);
    return {
      status: false,
      msg: "Invalid Private Key!",
    };
  }
};

export const setupNewAccount = async (PRIVATE_KEY, chain = base) => {
  try {

    const signer = privateKeyToAccount(PRIVATE_KEY);
    // Create ECDSA validator

    // Create Kernel Smart Account
    const account = await toSimple7702SmartAccount({
      client: publicClient,
      owner: signer,
    });

    const kernelClient = createSmartAccountClient({
      account: account,
      chain: CHAIN,
      bundlerTransport: http(BUNDLER_URL),
      client: publicClient,
      paymaster: paymasterClient,
      userOperation: {
              estimateFeesPerGas: async () =>
                (await paymasterClient.getUserOperationGasPrice()).fast,
            },
    });

    const trxnZero = await zeroTrxn(kernelClient,signer);
    let res;
    if (trxnZero?.status) {
      res = {
        status: true,
        data: {
          privatekey: PRIVATE_KEY,
          address: account.address,
          account: account,
          trxn: trxnZero.data,
        },
      };
    } else {
      res = {
        status: false,
        msg: "Error In Zero Trxn!",
      };
    }
    return res;
  } catch (error) {
    console.log("setupnewaccount error -->", error);
    return {
      status: false,
      msg: error?.message,
    };
  }
};

export const doAccountRecovery = async (PRIVATE_KEY, address) => {
  try {
    const getAccount = await checkPrivateKey(PRIVATE_KEY);
    if (!getAccount.status) {
      return {
        status: false,
        msg: "Invalid Private Key!",
      };
    }
    const signer = getAccount?.signer;
    // Create ECDSA validator

    // Create Kernel Smart Account
    const account = await toSimple7702SmartAccount({
      client: publicClient,
      owner: signer,
    });
    let res;
    if (address !== account.address) {
      res = {
        status: false,
        msg: "Invalid Private Key!",
      };
    } else {
      res = {
        status: true,
        data: {},
      };
    }
    return res;
  } catch (error) {
    console.log("setupnewaccount error -->", error);
    return {
      status: false,
      msg: error?.message,
    };
  }
};

export const getProvider = async (kernelClient) => {
  try {
    const kernelProvider = new EIP1193Provider(kernelClient);
    const ethersProvider = new ethers.providers.Web3Provider(kernelProvider);
    const signer = await ethersProvider.getSigner();
    return { kernelProvider, ethersProvider, signer };
  } catch (error) {
    console.log("provider error-->", error);
    return false;
  }
};

export const getAccount = async (PRIVATE_KEY, chain = base) => {
  try {

      const signer = privateKeyToAccount(PRIVATE_KEY);
      // Create ECDSA validator

      // Create Kernel Smart Account
    const account = await toSimple7702SmartAccount({
      client: publicClient,
      owner: signer,
    });

      const kernelClient = createSmartAccountClient({
        account,
        chain: chain ?? CHAIN,
        bundlerTransport: http(BUNDLER_URL),
        client: publicClient,
        paymaster: paymasterClient,
        userOperation: {
                estimateFeesPerGas: async () =>
                  (await paymasterClient.getUserOperationGasPrice()).fast,
              },
      });

      const quotes = await paymasterClient.getTokenQuotes({
                tokens: [usdc]
            })
    const paymaster = quotes[0].paymaster

      // Approve USDC for the paymaster (ensure that the account has enough USDC)
      const userOpHash = await kernelClient.sendTransaction({
                    calls: [
                      {
                        to: getAddress(usdc),
                        abi: parseAbi(["function approve(address,uint)"]),
                        functionName: "approve",
                        args: [paymaster, maxUint256],
                      },
                      {
                            to: zeroAddress,
                            value: BigInt(0),
                            data: "0x",
                          },
                    ],
                    paymasterContext: {
                      token: usdc,
                    },
                  });

      console.log("UserOp hash:", userOpHash);

      // Wait for the receipt of the user operation
      const receipt = await kernelClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      console.log("UserOp completed", receipt.receipt.transactionHash);

      if (!getAccount) {
        return {
          status: false,
          msg: "No Account Found!",
        };
      }
      return {
        status: true,
        account: account,
        kernelClient: kernelClient,
        address: account.address,
      };
  //  }
  } catch (error) {
    console.log("error-->", error);
    return { status: false, msg: error?.message || "Please Try again ALter!" };
  }
};

export const getRpcProvider = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://mainnet.base.org"
    );
    return provider;
  } catch (error) {
    return false;
  }
};

export const getETHEREUMRpcProvider = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://mainnet.infura.io/v3/a48f9442af1a4c8da44b4fc26640e23d"
    );
    return provider;
  } catch (error) {
    return false;
  }
};
