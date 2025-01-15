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
    _lowerHint: string,
    _supplyAmount: number | string,
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");

        const tx = await contract.addColl(
          ethers.BigNumber.from(_assetAmount.toString()),
          _upperHint,
          _lowerHint,
          { gasLimit: ethers.BigNumber.from("3000000"),value: ethers.BigNumber.from(_supplyAmount.toString())}
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
  
  Troves = async (address: string, walletAddress: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      console.log("line-267", address, walletAddress);
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");
  
        console.log("line-271", contract);
        
        // Call the Troves function (view function, no need to wait for receipt)
        const data = await contract.Troves(walletAddress);
        
        // Log the raw data returned from the contract
        console.log("Troves data:", data);
  
        resolve(data);  // Resolve with the data
      } catch (error: any) {
        console.log("line-279",error)
        reject(error.reason || error.data?.message || error.message || error);  // Handle errors properly
      }
    });
  };
  

  balanceOf = async (address: string, walletAddress: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      console.log("line-267", address, walletAddress);
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");
  
        console.log("line-271", contract);
        
        // Call the Troves function (view function, no need to wait for receipt)
        const data = await contract.balanceOf(walletAddress);
        
        // Log the raw data returned from the contract
        console.log("Troves data:", data);
  
        resolve(data);  // Resolve with the data
      } catch (error: any) {
        console.log("line-279",error)
        reject(error.reason || error.data?.message || error.message || error);  // Handle errors properly
      }
    });
  };

  closeTrove = async (address: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      console.log("line-267", address);
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");
  
        console.log("line-271", contract);
        
        // Call the Troves function (view function, no need to wait for receipt)
        const data = await contract.closeTrove();
        
        // Log the raw data returned from the contract
        console.log("Troves data:", data);
  
        resolve(data);  // Resolve with the data
      } catch (error: any) {
        console.log("line-279",error)
        reject(error.reason || error.data?.message || error.message || error);  // Handle errors properly
      }
    });
  };

  approve = async (
    address: string,
    spender: string,
    amount: ethers.BigNumber | string | number
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");
  
        const tx = await contract.approve(spender, ethers.BigNumber.from(amount));
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error: any) {
        console.log(error)
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  allowance = async (
    address: string,
    owner: string,
    spender: string
  ): Promise<ethers.BigNumber> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Get contract instance
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");
  
        // Call allowance method
        const currentAllowance = await contract.allowance(owner, spender);
        resolve(ethers.BigNumber.from(currentAllowance));
      } catch (error: any) {
        console.log(error);
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };


  adjustTrove = async (
    address: string,
    _maxFeePercentage: number | string,
    _collWithdrawal: number | string,
    _THUSDChange: number | string,
    _isDebtIncrease:boolean,
    _assetAmount: number | string,
    _upperHint: string,
    _lowerHint: string,
    _supplyValue:number | string
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("line-389",_collWithdrawal,_supplyValue)
        console.log("line-390",ethers.BigNumber.from(_collWithdrawal.toString()),ethers.BigNumber.from(_supplyValue.toString()))
        const contract = this.getContract(address);
        console.log("line-41", contract);
        if (!contract) throw new Error("Contract initialization failed");
        console.log("line-43", contract);

        const tx = await contract?.adjustTrove(
          ethers.BigNumber.from(_maxFeePercentage.toString()),
          ethers.BigNumber.from(_collWithdrawal.toString()),
          ethers.BigNumber.from(_THUSDChange.toString()),
          _isDebtIncrease,
          ethers.BigNumber.from(_assetAmount.toString()),
          _upperHint,
          _lowerHint,
          { gasLimit: ethers.BigNumber.from("3000000"),value: ethers.BigNumber.from(_supplyValue.toString())}
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
}

export default Web3Interaction;