import {
  Chain,
  ChainToHexChainId,
  type ConnectWalletParams,
  type EVMChain,
  EVMChains,
  type EthereumWindowProvider,
  WalletOption,
  ensureEVMApiKeys,
  filterSupportedChains,
  prepareNetworkSwitch,
  setRequestClientConfig,
  switchEVMWalletNetwork,
} from "@swapkit/helpers";
import type { NonETHToolbox } from "@swapkit/toolbox-evm";
import type { BrowserProvider, Eip1193Provider } from "ethers";
import { KernelEIP1193Provider } from "@zerodev/sdk/providers";
declare const window: {
  ethereum: EthereumWindowProvider;
  trustwallet: EthereumWindowProvider;
  coinbaseWalletExtension: EthereumWindowProvider;
  braveSolana: any;
} & Window;

export type EVMWalletOptions =
  | WalletOption.BRAVE
  | WalletOption.OKX_MOBILE
  | WalletOption.METAMASK
  | WalletOption.TRUSTWALLET_WEB
  | WalletOption.COINBASE_WEB
  | WalletOption.EIP6963;

const getWalletForType = (
  walletType:
    | WalletOption.BRAVE
    | WalletOption.OKX_MOBILE
    | WalletOption.METAMASK
    | WalletOption.TRUSTWALLET_WEB
    | WalletOption.COINBASE_WEB
) => {
  switch (walletType) {
    case WalletOption.BRAVE:
    case WalletOption.METAMASK:
    case WalletOption.OKX_MOBILE:
      return window.ethereum;
    case WalletOption.COINBASE_WEB:
      return window.coinbaseWalletExtension;
    case WalletOption.TRUSTWALLET_WEB:
      return window.trustwallet;
  }
};

export const getWeb3WalletMethods = async ({
  ethereumWindowProvider,
  chain,
  covalentApiKey,
  ethplorerApiKey,
  provider,
}: {
  ethereumWindowProvider: Eip1193Provider | undefined;
  chain: EVMChain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  provider: BrowserProvider;
}) => {
  if (!ethereumWindowProvider)
    throw new Error("Requested web3 wallet is not installed");
  const { getToolboxByChain } = await import("@swapkit/toolbox-evm");

  const keys = ensureEVMApiKeys({ chain, covalentApiKey, ethplorerApiKey });
  const signer = await provider.getSigner();

  const toolbox = getToolboxByChain(chain)({ ...keys, provider, signer });

  if (chain !== Chain.Ethereum) {
    const currentNetwork = await provider.getNetwork();
    if (currentNetwork.chainId.toString() !== ChainToHexChainId[chain]) {
      try {
        await switchEVMWalletNetwork(
          provider,
          ChainToHexChainId[chain],
          (toolbox as NonETHToolbox).getNetworkParams()
        );
      } catch (_error) {
        throw new Error(`Failed to add/switch ${chain} network: ${chain}`);
      }
    }
  }

  return prepareNetworkSwitch<typeof toolbox>({
    toolbox: { ...toolbox },
    chainId: ChainToHexChainId[chain],
    provider,
  });
};

export const getWalletMethods = async ({
  chain,
  covalentApiKey,
  ethplorerApiKey,
  provider,
}: {
  chain: EVMChain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  provider: BrowserProvider;
}) => {
  const { getToolboxByChain } = await import("@swapkit/toolbox-evm");

  const keys = ensureEVMApiKeys({ chain, covalentApiKey, ethplorerApiKey });
  const signer = await provider.getSigner();

  const toolbox = getToolboxByChain(chain)({ ...keys, provider, signer });

  if (chain !== Chain.Ethereum) {
    const currentNetwork = await provider.getNetwork();
    if (currentNetwork.chainId.toString() !== ChainToHexChainId[chain]) {
      try {
        await switchEVMWalletNetwork(
          provider,
          ChainToHexChainId[chain],
          (toolbox as NonETHToolbox).getNetworkParams()
        );
      } catch (_error) {
        throw new Error(`Failed to add/switch ${chain} network: ${chain}`);
      }
    }
  }

  return prepareNetworkSwitch<typeof toolbox>({
    toolbox: { ...toolbox },
    chainId: ChainToHexChainId[chain],
    provider,
  });
};

function connectEVMWallet({
  addChain,
  config: { covalentApiKey, ethplorerApiKey, thorswapApiKey },
}: ConnectWalletParams) {
  return async function connectEVMWallet(
    chains: Chain[],
    walletType: EVMWalletOptions = WalletOption.METAMASK,
    kernelProvider: KernelEIP1193Provider,
    eip1193Provider?: Eip1193Provider
  ) {
    console.log("line-527")
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const supportedChains = filterSupportedChains(
      chains,
      EVMChains,
      walletType
    );
    const { getProvider } = await import("@swapkit/toolbox-evm");
    console.log("line-536")
    const { BrowserProvider } = await import("ethers");
    console.log("line-538")

    const ethersProvider = new BrowserProvider(kernelProvider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    console.log("line-43", signer, address);

    const promises = supportedChains.map(async (chain) => {
      const walletMethods = await getWalletMethods({
        chain: chain as EVMChain,
        ethplorerApiKey,
        covalentApiKey,
        provider: ethersProvider,
      });

      const getBalance = async (potentialScamFilter = true) =>
        walletMethods.getBalance(
          address,
          potentialScamFilter,
          getProvider(chain as EVMChain)
        );
      console.log("line-559", getBalance);
      const disconnect = () =>
        ethersProvider.send("wallet_revokePermissions", [
          {
            eth_accounts: {},
          },
        ]);

      addChain({
        ...walletMethods,
        disconnect,
        chain,
        address,
        getBalance,
        balance: [],
        walletType,
      });
    });

    await Promise.all(promises);

    return true;
  };
}
export const evmWallet = { connectEVMWallet } as const;
