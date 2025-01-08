// Import ABIs
import borrowerContractABI from "../../borrowerContract.json";
import { ethers } from "ethers";
import fetchPriceAbi from '../../fetchPriceContractAbi.json'

class Web3Interaction {
  private PROVIDER: any;
  private SIGNER: any;

  constructor(currentNetwork?: any, provider?: any) {
    if (provider) {
      this.PROVIDER = new ethers.providers.Web3Provider(
        provider || (window as any).ethereum,
        currentNetwork || "sepolia"
      );
      this.SIGNER = this.PROVIDER.getSigner();
    }
  }

  getContractFetchPrice = (address: string) => {
    try {
      const contract = new ethers.Contract(
        address,
        fetchPriceAbi,
        this.SIGNER
      );
      return contract;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  };

  getContract = (address: string) => {
    try {
      const contract = new ethers.Contract(
        address,
        borrowerContractABI,
        this.SIGNER
      );
      return contract;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  };

  fetchPrice = async (
    address: string,
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContractFetchPrice(address);
        if (!contract) throw new Error("Contract initialization failed");
        console.log("line-93",contract,address)
        const tx = await contract?.latestAnswer();
        console.log("line-53", tx.toString());
        // const receipt = await tx.wait();

        resolve(tx.toString());
      } catch (error: any) {
        console.log("errrrrrrr", error);
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  openTrove = async (
    address: string,
    _assetAmount: number | string,
    _THUSDAmount: number | string,
    _maxFeePercentage: number | string,
    recommendedFee: number | string,
    _upperHint: string,
    _lowerHint: string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("values",typeof recommendedFee,recommendedFee)
        const contract = this.getContract(address);
        console.log("line-41", contract);
        if (!contract) throw new Error("Contract initialization failed");
        console.log("line-43", contract);

        const tx = await contract?.openTrove(
          ethers.BigNumber.from(_maxFeePercentage.toString()),
          ethers.BigNumber.from(_THUSDAmount.toString()),
          ethers.BigNumber.from(_assetAmount.toString()),
          _upperHint,
          _lowerHint,
          { gasLimit: ethers.BigNumber.from("3000000"),value: ethers.BigNumber.from(recommendedFee.toString())}
        );
        console.log("line-53", tx);
        const receipt = await tx.wait();

        resolve(receipt);
      } catch (error: any) {
        console.log("errrrrrrr", error);
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  withdrawTHUSD = async (
    address: string,
    _maxFeePercentage: number | string,
    _THUSDAmount: number | string,
    _upperHint: string,
    _lowerHint: string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");

        const tx = await contract.withdrawTHUSD(
          ethers.BigNumber.from(_maxFeePercentage.toString()),
          ethers.BigNumber.from(_THUSDAmount.toString()),
          _upperHint,
          _lowerHint
        );
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  repayTHUSD = async (
    address: string,
    _THUSDAmount: number | string,
    _upperHint: string,
    _lowerHint: string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");

        const tx = await contract.repayTHUSD(
          ethers.BigNumber.from(_THUSDAmount.toString()),
          _upperHint,
          _lowerHint
        );
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  withdrawColl = async (
    address: string,
    _collWithdrawal: number | string,
    _upperHint: string,
    _lowerHint: string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");

        const tx = await contract.withdrawColl(
          ethers.BigNumber.from(_collWithdrawal.toString()),
          _upperHint,
          _lowerHint
        );
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  getAssetAmount = async (
    address: string,
    _assetAmount: number | string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");

        const tx = await contract.getAssetAmount(
          ethers.BigNumber.from(_assetAmount.toString())
        );
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  addColl = async (
    address: string,
    _assetAmount: number | string,
    _upperHint: string,
    _lowerHint: string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");

        const tx = await contract.addColl(
          ethers.BigNumber.from(_assetAmount.toString()),
          _upperHint,
          _lowerHint
        );
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  burnDebtFromPCV = async (
    address: string,
    _thusdToBurn: number | string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");

        const tx = await contract.burnDebtFromPCV(
          ethers.BigNumber.from(_thusdToBurn.toString())
        );
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  mintBootstrapLoanFromPCV = async (
    address: string,
    _thusdToMint: number | string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");

        const tx = await contract.mintBootstrapLoanFromPCV(
          ethers.BigNumber.from(_thusdToMint.toString())
        );
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };
}

export default Web3Interaction;