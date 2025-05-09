/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from "ethers";

const getChainId = async (provider: any): Promise<any> => {
  try {

    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const networkDetails = await ethersProvider.getNetwork();
    return networkDetails.chainId.toString();
  } catch (error) {
    return error;
  }
}

const getAccounts = async (provider: any): Promise<any> => {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();

    const address = signer.getAddress();

    return await address;
  } catch (error) {
    return error;
  }
}

const getBalance = async (provider: any): Promise<string> => {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();

    const address = signer.getAddress();

    const balance = ethers.utils.formatEther(
      await ethersProvider.getBalance(address) // Balance is in wei
    );

    return balance;
  } catch (error) {
    return error as string;
  }
}


const signMessage = async (provider: any): Promise<any> => {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = await ethersProvider.getSigner();
    const originalMessage = "YOUR_MESSAGE";

    const signedMessage = await signer.signMessage(originalMessage);

    return signedMessage;
  } catch (error) {
    return error as string;
  }
}

export default { getChainId, getAccounts, getBalance,  signMessage };