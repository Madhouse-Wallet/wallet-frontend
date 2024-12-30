// Import ABIs
import borrowerContractABI from "../borrowerContract.json";
import { ethers } from "ethers";

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

  // private provider: ethers.providers.Provider;
  // private signer: ethers.Signer;

  // constructor(rpcUrl: string, privateKey: string) {
  //   // Initialize the provider using the given RPC URL
  //   this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  //   // Initialize the signer using the provided private key
  //   this.signer = new ethers.Wallet(privateKey, this.provider);
  // }

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

  // private getContract(address: string) {
  //   try {
  //     const contract = new ethers.Contract(address, borrowerContractABI, this.signer);
  //     return contract;
  //   } catch (error) {
  //     console.error("Error initializing contract:", error);
  //     return null;
  //   }
  // }

  // openTrove = async (
  //   address: string,
  //   _maxFeePercentage: number,
  //   _THUSDAmount: number,
  //   _assetAmount: number,
  //   _upperHint: string,
  //   _lowerHint: string,
  // ): Promise<any> => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const contract = this.getContract(address);
  //       console.log("line-41",contract)
  //       if (!contract) throw new Error("Contract initialization failed");
  //       console.log("line-43",contract)
  //       const tx = await contract?.openTrove(
  //           _maxFeePercentage,
  //           _THUSDAmount,
  //           _assetAmount,
  //           _upperHint,
  //           _lowerHint,
  //       );
  //       console.log("line-53",tx)
  //       const receipt = await tx.wait();

  //       resolve(receipt);
  //     } catch (error: any) {
  //       console.log("errrrrrrr",error)
  //       reject(error.reason || error.data?.message || error.message || error);
  //     }
  //   });
  // };

  openTrove = async (
    address: string,
    _maxFeePercentage: number | string,
    _THUSDAmount: number | string,
    _assetAmount: number | string,
    _upperHint: string,
    _lowerHint: string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
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
          { gasLimit: ethers.BigNumber.from("3000000") }
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
