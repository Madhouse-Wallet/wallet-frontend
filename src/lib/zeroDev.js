"use client";
import { zeroAddress, parseUnits } from "viem";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";

import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  gasTokenAddresses,
  getERC20PaymasterApproveCall,
} from "@zerodev/sdk";

import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { ethers } from "ethers";
import { createPublicClient, http,parseEther,createWalletClient } from "viem";
import { base } from "viem/chains";
import { KernelEIP1193Provider } from "@zerodev/sdk/providers";
import { generatePrivateKey, privateKeyToAccount, privateKeyToAddress } from "viem/accounts";
import { toSafeSmartAccount } from "permissionless/accounts";
const timers = require('timers-promises')
import { safeAbiImplementation } from "./safeAbi";
import { getSafeModuleSetupData } from "./getSetupData";
import dotenv from "dotenv";


dotenv.config();

export let BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;
export const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}`;

export const MAINNET_BUNDLER_URL = `https://rpc.zerodev.app/api/v2/bundler/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID_ETH}`;
export const MAINNET_PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID_ETH}`;

const RELAY_PRIVATE_KEY = '8e96e75fd7deb4d53de994ef79bbf995ac91f134ae9e71d660775a99b2d0bd66'


const CHAIN = base

const entryPoint = getEntryPoint("0.7");

let paymasterClient = createZeroDevPaymasterClient({
  chain: CHAIN,
  transport: http(PAYMASTER_RPC),
});

let publicClient = createPublicClient({
  transport: http(BUNDLER_URL),
  chain: CHAIN,
});

export const zeroTrxn = async (kernelClient) => {
  try {
    const txnHash = await kernelClient.sendTransaction({
      to: zeroAddress, // use any address
      value: BigInt(0), // default to 0
      data: "0x", // default to 0x
    });
    return {
      status: true,
      data: txnHash,
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

          const eoaPrivateKey =  PRIVATE_KEY //`0x${EOA_PRIVATE_KEY}`;
          if (!eoaPrivateKey) throw new Error("EOA_PRIVATE_KEY is required");

          const relayPrivateKey = `0x${RELAY_PRIVATE_KEY}`;
          if (!relayPrivateKey) throw new Error("RELAY_PRIVATE_KEY is required");

          const safePrivateKey =  generatePrivateKey(); 
          if (!safePrivateKey) throw new Error("SAFE_PRIVATE_KEY is required");

          const account = privateKeyToAccount(eoaPrivateKey);


          const walletClient = createWalletClient({
            account,
            chain: base,
            transport: http(),
          });


          const relayAccount = privateKeyToAccount(relayPrivateKey);

          const relayClient = createWalletClient({
            account: relayAccount,
            chain: base,
            transport: http(),
          })

          const [walletAddress] = await walletClient.getAddresses() 
          console.log(`Wallet Address:  https://basescan.org/address/${walletAddress}`)
          console.log(`Wallet Private Key:  ${eoaPrivateKey}`)
          console.log(`Signer Private Key:  ${safePrivateKey}`)


          const hash = await relayClient.sendTransaction({ 
            to: walletAddress,
            value: parseEther('0.000001')
          })



          console.log(`Sent eth for account creation: https://basescan.org/tx/${hash}`)
          await timers.setTimeout(5000); //need to wait for at least 3 secs or it will fail, so i wait 5 secs

          const SAFE_SINGLETON_ADDRESS = "0x41675C099F32341bf84BFc5382aF534df5C7461a";

          const authorization = await walletClient.signAuthorization({
            contractAddress: SAFE_SINGLETON_ADDRESS,
          });

          const SAFE_MULTISEND_ADDRESS = "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526";
          const SAFE_4337_MODULE_ADDRESS = "0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226";

          const owners = [privateKeyToAddress(safePrivateKey)];
          const signerThreshold = 1n;
          const setupAddress = SAFE_MULTISEND_ADDRESS;
          const setupData = getSafeModuleSetupData();
          const fallbackHandler = SAFE_4337_MODULE_ADDRESS;
          const paymentToken = zeroAddress;
          const paymentValue = BigInt(0);
          const paymentReceiver = zeroAddress;

          const txHash = await walletClient.writeContract({
            address: account.address,
            abi: safeAbiImplementation,
            functionName: "setup",
            args: [
              owners,
              signerThreshold,
              setupAddress,
              setupData,
              fallbackHandler,
              paymentToken,
              paymentValue,
              paymentReceiver,
            ],
            authorizationList: [authorization],
          });

          console.log(`Created Smart Account: https://basescan.org/tx/${txHash}`);

          const publicClient = createPublicClient({
                chain: base,
                transport: http(),
              });

            const safeAccount = await toSafeSmartAccount({
              address: privateKeyToAddress(eoaPrivateKey),
              owners: [privateKeyToAccount(safePrivateKey)],
              client: publicClient,
              version: "1.4.1",
            });


    let res;
    if (txHash) {
      res = {
        status: true,
        data: {
          privatekey: PRIVATE_KEY,
          signerkey: safePrivateKey,
          address: safeAccount.address,
          account: safeAccount,
          trxn: txHash.data,
        },
      };
    } else {
      res = {
        status: false,
        msg: "Error in account creation",
      };
    }
    return res;
  } catch (error) {
    console.log("Error setting up new account -->", error);
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
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      entryPoint,
      kernelVersion: KERNEL_V3_1,
    });

    // Create Kernel Smart Account
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion: KERNEL_V3_1,
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
    const kernelProvider = new KernelEIP1193Provider(kernelClient);
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
    if (chain === mainnet) {
      paymasterClient = createZeroDevPaymasterClient({
        chain,
        transport: http(MAINNET_PAYMASTER_RPC),
      });
      BUNDLER_URL = MAINNET_BUNDLER_URL;

      publicClient = createPublicClient({
        transport: http(BUNDLER_URL),
        chain,
      });

      const signer = privateKeyToAccount(PRIVATE_KEY);
      // Create ECDSA validator

      // Create Circle Paymaster Client
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint,
        kernelVersion: KERNEL_V3_1,
      });

      // Create Kernel Smart Account
      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint,
        kernelVersion: KERNEL_V3_1,
      });

      const kernelClient = createKernelAccountClient({
        account,
        chain: chain ?? CHAIN,
        bundlerTransport: http(BUNDLER_URL),
        client: publicClient,
        paymaster: paymasterClient,
        paymasterContext: {
          token: gasTokenAddresses[(chain ?? CHAIN).id].PAXG,
        },
      });

      // Approve PAXG for the paymaster (ensure that the account has enough PAXG)
      const userOpHash = await kernelClient.sendUserOperation({
        callData: await account.encodeCalls([
          await getERC20PaymasterApproveCall(paymasterClient, {
            gasToken: gasTokenAddresses[(chain ?? CHAIN).id].PAXG,
            approveAmount: parseUnits("1", 6),
            entryPoint,
          }),
          {
            to: zeroAddress,
            value: BigInt(0),
            data: "0x",
          },
        ]),
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
    } else if (chain === base) {
      paymasterClient = createZeroDevPaymasterClient({
        chain: CHAIN,
        transport: http(PAYMASTER_RPC),
      });
      BUNDLER_URL =
        "https://rpc.zerodev.app/api/v2/bundler/310cd92b-af6a-470d-9496-754b31de2c48";
      publicClient = createPublicClient({
        transport: http(BUNDLER_URL),
        chain: CHAIN,
      });

      const signer = privateKeyToAccount(PRIVATE_KEY);
      // Create ECDSA validator

      // Create Circle Paymaster Client
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint,
        kernelVersion: KERNEL_V3_1,
      });

      // Create Kernel Smart Account
      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint,
        kernelVersion: KERNEL_V3_1,
      });

      const kernelClient = createKernelAccountClient({
        account,
        chain: chain ?? CHAIN,
        bundlerTransport: http(BUNDLER_URL),
        client: publicClient,
        paymaster: paymasterClient,
        paymasterContext: {
          token: gasTokenAddresses[(chain ?? CHAIN).id].USDC,
        },
      });

      // Approve USDC for the paymaster (ensure that the account has enough USDC)
      const userOpHash = await kernelClient.sendUserOperation({
        callData: await account.encodeCalls([
          await getERC20PaymasterApproveCall(paymasterClient, {
            gasToken: gasTokenAddresses[(chain ?? CHAIN).id].USDC,
            approveAmount: parseUnits("1", 6),
            entryPoint,
          }),
          {
            to: zeroAddress,
            value: BigInt(0),
            data: "0x",
          },
        ]),
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
    }
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
