"use client";
import { zeroAddress, createPublicClient,
         http,parseEther,createWalletClient, parseAbi } from "viem";
import { ethers } from "ethers";
import { base } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount,
        privateKeyToAddress } from "viem/accounts";
import { toSafeSmartAccount  } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico"
import { createSmartAccountClient } from "permissionless"
import { eip7702Actions } from "viem/experimental";
import { safeAbiImplementation } from "./safeAbi";
import { getSafeModuleSetupData } from "./getSetupData";
import { KernelEIP1193Provider } from "./safeEIP1193Provider";
import dotenv from "dotenv";
import timers from 'timers-promises'
dotenv.config();

const PIMLICO_API_KEY= process.env.NEXT_PUBLIC_PIMLICO_API_KEY
const RELAY_PRIVATE_KEY = process.env.NEXT_PUBLIC_RELAY_PRIVATE_KEY
const pimlicoUrl = `https://api.pimlico.io/v2/${base.id}/rpc?apikey=${PIMLICO_API_KEY}`;


const SAFE_PRIVATE_KEY = process.env.NEXT_PUBLIC_RELAY_PRIVATE_KEY


export const publicClient = createPublicClient({
          chain: base,
          transport: http(),
        });

const pimlicoClient = createPimlicoClient({
        chain: base,
        transport: http(pimlicoUrl),
      });


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

          const relayPrivateKey = RELAY_PRIVATE_KEY;
          if (!relayPrivateKey) throw new Error("RELAY_PRIVATE_KEY is required");

          const safePrivateKey =  SAFE_PRIVATE_KEY;
          if (!safePrivateKey) throw new Error("SAFE_PRIVATE_KEY is required");

          const account = privateKeyToAccount(eoaPrivateKey);


          const walletClient = createWalletClient({
            account,
            chain: base,
            transport: http(),
          }).extend(eip7702Actions());



          const relayAccount = privateKeyToAccount(relayPrivateKey);

          const relayClient = createWalletClient({
            account: relayAccount,
            chain: base,
            transport: http(),
          })

          const [walletAddress] = await walletClient.getAddresses() 
          console.log(`Wallet Address:  https://basescan.org/address/${walletAddress}`);

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
          privatekey: eoaPrivateKey, //PRIVATE_KEY,
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
   const eoaPrivateKey=PRIVATE_KEY
   const  safePrivateKey= SAFE_PRIVATE_KEY
    //eoaPrivateKey=PRIVATE_KEY

    const account = await toSafeSmartAccount({
          address: privateKeyToAddress(eoaPrivateKey),
          owners: [privateKeyToAccount(safePrivateKey)],
          client: publicClient,
          version: "1.4.1",
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
    console.log("error recovering account -->", error);
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
    
    const eoaPrivateKey = PRIVATE_KEY;
    if (!eoaPrivateKey) throw new Error("EOA_PRIVATE_KEY is required");

    const safePrivateKey = SAFE_PRIVATE_KEY;
    if (!safePrivateKey) throw new Error("SAFE_PRIVATE_KEY is required");

    const pimlicoApiKey = 'pim_gCvmGFU2NgG2xZcmjKVNsE';
    if (!pimlicoApiKey) throw new Error("PIMLICO_API_KEY is required");

        //eoaPrivateKey = PRIVATE_KEY
        const account = await toSafeSmartAccount({
          address: privateKeyToAddress(eoaPrivateKey),
          owners: [privateKeyToAccount(safePrivateKey)],
          client: publicClient,
          version: "1.4.1",
        });

    const smartAccountClient = createSmartAccountClient({
          chain: base,
          account: account,
          paymaster: pimlicoClient,
          bundlerTransport: http(pimlicoUrl),
          userOperation: {
            estimateFeesPerGas: async () =>
              (await pimlicoClient.getUserOperationGasPrice()).fast,
          },
        });



      if (!getAccount) {
        return {
          status: false,
          msg: "No Account Found!",
        };
      }
      return {
        status: true,
        account: account,
        kernelClient: smartAccountClient,
        address: account.address,
      };


 
     } catch (error) {
    console.log("error-->", error);
    return { status: false, msg: error?.message || "Please Try again ALter!" };
  }
};

export const usdc = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

export const sendTransaction = async (smartAccountClient,params) => {
        
        const quotes = await pimlicoClient.getTokenQuotes({
          tokens: [usdc],
        })
        const { postOpGas, exchangeRate, paymaster } = quotes[0]
        
     try{
        const userOperation = await smartAccountClient.prepareUserOperation({
          calls: [
           params
          ],
        })
  
        const userOperationMaxGas =
          userOperation.preVerificationGas +
          userOperation.callGasLimit +
          userOperation.verificationGasLimit +
          (userOperation.paymasterPostOpGasLimit || 0n) +
          (userOperation.paymasterVerificationGasLimit || 0n)
        
        const userOperationMaxCost = userOperationMaxGas * userOperation.maxFeePerGas
        
        // using formula here https://github.com/pimlicolabs/singleton-paymaster/blob/main/src/base/BaseSingletonPaymaster.sol#L334-L341
        const maxCostInToken =
          ((userOperationMaxCost + postOpGas * userOperation.maxFeePerGas) * exchangeRate) / BigInt(1e18)
        
        const hash = await smartAccountClient.sendUserOperation({
          paymasterContext: {
            token: usdc,
            validForSeconds: 60, 
          },
          calls: [
            {
              abi: parseAbi(["function approve(address,uint)"]),
              functionName: "approve",
              args: [paymaster, maxCostInToken],
              to: usdc,
            },
              params
          ],
        })
        
        const opReceipt = await smartAccountClient.waitForUserOperationReceipt({
          hash,
        })
        
        console.log(`transactionHash: https://basescan.org/tx/${opReceipt.receipt.transactionHash}`)

       return opReceipt.receipt.transactionHash;
       //return true;
            }catch(error){
          console.log(`Error in transaction: ${error}`)
          return error;
      }
}


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


export const USDC_ABI = [
      {
        constant: false,
        inputs: [
          {
            name: "spender",
            type: "address",
          },
          {
            name: "amount",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "to",
            type: "address",
          },
          {
            name: "amount",
            type: "uint256",
          },
        ],
        name: "transfer",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
        ],
        name: "allowance",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "account",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ];

    export const passkeyValidator = async()=>{
      return true;
    }