import {
  CHAIN_NAMESPACES,
  IProvider,
  WEB3AUTH_NETWORK,
  type IAdapter,
} from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth, type Web3AuthOptions } from "@web3auth/modal";
import {
  AccountAbstractionProvider,
  SafeSmartAccount,
} from "@web3auth/account-abstraction-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import ethers from "@/ethers";
import { parseAbi } from "viem";

// Types
interface ChainConfig {
  chainNamespace: string;
  chainId: string;
  rpcTarget: string;
  displayName: string;
  blockExplorerUrl: string;
  ticker: string;
  tickerName: string;
  logo: string;
}

interface Web3AuthInstance {
  web3auth: Web3Auth | null;
  provider: IProvider | null;
  loading: boolean;
  error: Error | null;
}

// Your configuration values
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;
const pimlicoApiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY!;
const erc20TokenAddresss = process.env.NEXT_PUBLIC_ERC20_TOKEN_ADDRESS!;

// Chain configuration
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Sepolia testnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

// Create Account Abstraction Provider
const accountAbstractionProvider = new AccountAbstractionProvider({
  config: {
    chainConfig,
    smartAccountInit: new SafeSmartAccount(),
    bundlerConfig: {
      url: `https://api.pimlico.io/v2/11155111/rpc?apikey=pim_RVmdrqc1CrXLqaKPHVCpDN`,
      paymasterContext: {
        type: "TOKEN",
        token: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      },
    },
    paymasterConfig: {
      url: `https://api.pimlico.io/v2/11155111/rpc?apikey=pim_RVmdrqc1CrXLqaKPHVCpDN`,
    },
  },
});

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  privateKeyProvider,
  accountAbstractionProvider,
};

export const initWeb3Auth = async (): Promise<Web3Auth> => {
  const web3auth = new Web3Auth(web3AuthOptions);
  console.log("line-220", web3auth);
  try {
    const adapters = await getDefaultExternalAdapters({
      options: web3AuthOptions,
    });
    adapters.forEach((adapter: IAdapter<unknown>) => {
      web3auth.configureAdapter(adapter);
    });

    await web3auth.initModal();
    console.log("line-230", web3auth);
    return web3auth;
  } catch (error) {
    console.error("Error initializing Web3Auth:", error);
    throw error;
  }
};

export const connectWeb3Auth = async (
  web3auth: Web3Auth | null
): Promise<IProvider | null> => {
  if (!web3auth) {
    throw new Error("web3auth not initialized");
  }
  const web3authProvider = await web3auth.connect();
  return web3authProvider;
};

export const disconnectWeb3Auth = async (
  web3auth: Web3Auth | null
): Promise<void> => {
  if (!web3auth) {
    throw new Error("web3auth not initialized");
  }
  await web3auth.logout();
};

export const getUserInfo = async (web3auth: Web3Auth | null) => {
  if (!web3auth) {
    throw new Error("web3auth not initialized");
  }
  const userInfo = await web3auth.getUserInfo();
  return userInfo;
};

// Storage keys
export const STORAGE_KEYS = {
  ADDRESS: "web3auth_address",
  USER_INFO: "web3auth_user_info",
  BALANCE: "web3auth_balance",
} as const;

// export const transferERC20WithGasToken = async (
//   web3Auth: Web3Auth, // Accept Web3Auth instance directly
//   erc20TokenAddress: string,
//   recipientAddress: string,
//   amount: string
// ): Promise<void> => {
//   // Check if Web3Auth is initialized

//   console.log("line-279", clientId, pimlicoApiKey, erc20TokenAddresss);
//   if (!web3Auth || !web3Auth.provider) {
//     throw new Error("web3Auth provider not initialized");
//   }

//   const provider = new ethers.providers.Web3Provider(web3Auth.provider);
//   const signer = provider.getSigner();

//   // Create an instance of the ERC20 contract
//   const erc20Abi = [
//     "function transfer(address to, uint256 amount) public returns (bool)",
//   ];
//   const erc20Contract = new ethers.Contract(
//     erc20TokenAddress,
//     erc20Abi,
//     signer
//   );

//   // Prepare the transaction data
//   // const txData = await erc20Contract.populateTransaction.transfer(
//   //   recipientAddress,
//   //   ethers.utils.parseUnits(amount, 18) // Assuming 18 decimals for the ERC20 token
//   // );

//   // Prepare the transaction object
//   const transaction = await signer.sendTransaction({
//     to: recipientAddress,
//     data: "0x",
//     value: ethers.utils.parseUnits(amount, 18), // No ETH is being sent
//   });

//   // Wait for the transaction to be mined
//   const receipt = await transaction.wait();

//   console.log("Transaction sent! Hash:", transaction.hash);
//   console.log("Transaction mined! Receipt:", receipt);
// };


export const transferERC20WithGasToken = async (
  web3Auth: Web3Auth,
  erc20TokenAddress: string,
  recipientAddress: string,
  amount: string
): Promise<string> => {
  if (!web3Auth || !web3Auth.provider) {
    throw new Error("web3Auth provider not initialized");
  }

  // Initialize the account abstraction provider (assuming this is done elsewhere)
  
  const bundlerClient = accountAbstractionProvider.bundlerClient!;
  const smartAccount = accountAbstractionProvider.smartAccount!;

  // Constants
  const pimlicoPaymasterAddress = "0x0000000000000039cd5e8aE05257CE51C473ddd1";
  const approvalAmount = 10000000n; // 10 USDC (6 decimals)

  // Convert the amount to BigInt (assuming 18 decimals, adjust if different)
  const amountInWei = ethers.utils.parseUnits(amount, 18).toBigInt();

  // Send the user operation
  const userOpHash = await bundlerClient.sendUserOperation({
    account: smartAccount,
    calls: [
      // First approve USDC for the paymaster
      {
        to: erc20TokenAddress,
        abi: parseAbi(["function approve(address,uint)"]),
        functionName: "approve",
        args: [pimlicoPaymasterAddress, approvalAmount],
      },
      // Then perform the actual transfer
      {
        to: erc20TokenAddress,
        abi: parseAbi(["function transfer(address,uint256) returns (bool)"]),
        functionName: "transfer",
        args: [recipientAddress, amountInWei],
      }
    ],
  });

  // Wait for the transaction receipt
  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log("Transaction sent! Hash:", receipt.receipt.transactionHash);
  
  return receipt.receipt.transactionHash;
};