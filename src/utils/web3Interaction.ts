// Import ABIs
import borrowerContractABI from "../../borrowerContract.json";
import { ethers } from "ethers";
import fetchPriceAbi from "../../fetchPriceContractAbi.json";
import { getContract } from "viem";
import curveContractAbi from "../../curveAbi.json";

class Web3Interaction {
  private PROVIDER: any;
  private SIGNER: any;

  constructor(currentNetwork?: any, provider?: any) {
    if (provider) {
      // this.PROVIDER = new ethers.providers.Web3Provider(
      //   provider || (window as any).ethereum,
      //   currentNetwork || "sepolia"
      // );
      this.PROVIDER = provider;
      this.SIGNER = this.PROVIDER.getSigner();
      console.log("line-18", this.PROVIDER, this.SIGNER);

      // Using signer to get balance
      const getBalanceWithSigner = async () => {
        const balance = await this.SIGNER.getBalance();
        const ethBalance = ethers.utils.formatEther(balance);
        console.log("Balance using signer:", ethBalance);
        return ethBalance;
      };

      getBalanceWithSigner();
    }
  }

  getContractFetchPrice = (address: string) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-sepolia.public.blastapi.io"
      ); // Use your provider
      const contract = new ethers.Contract(address, fetchPriceAbi, provider);
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

  fetchPrice = async (address: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContractFetchPrice(address);
        if (!contract) throw new Error("Contract initialization failed");
        const tx = await contract?.latestAnswer();
        resolve(tx.toString());
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  openTrove = async (
    address: any,
    _assetAmount: number | string,
    _THUSDAmount: number | string,
    _maxFeePercentage: number | string,
    recommendedFee: number | string,
    _upperHint: string,
    _lowerHint: string,
    provider: any
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("line-86", recommendedFee.toString());
        console.log(
          "detauils",
          BigInt(_maxFeePercentage.toString()),
          BigInt(_THUSDAmount.toString()),
          BigInt(_assetAmount.toString()),
          BigInt(recommendedFee.toString())
        );
        const tx = await provider.writeContract({
          address,
          abi: borrowerContractABI,
          functionName: "openTrove",
          args: [
            BigInt(_maxFeePercentage.toString()),
            BigInt(_THUSDAmount.toString()),
            BigInt(recommendedFee.toString()),
            _upperHint,
            _lowerHint,
          ],
          gasLimit: BigInt("3000000"),
          // value: BigInt(recommendedFee.toString()),
        });
        // const tx = await contract?.write.openTrove(
        //   [
        //     BigInt(_maxFeePercentage.toString()),
        //     BigInt(_THUSDAmount.toString()),
        //     BigInt(_assetAmount.toString()),
        //     _upperHint,
        //     _lowerHint,
        //   ],
        //   {
        //     gasLimit: BigInt("3000000"),
        //     value: BigInt(recommendedFee.toString()),
        //   }
        // );
        console.log("txtxtx", tx);
        const receipt = tx;
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  //   openTrove = async (
  //     address: string,
  //     _assetAmount: number | string,
  //     _THUSDAmount: number | string,
  //     _maxFeePercentage: number | string,
  //     recommendedFee: number | string,
  //     _upperHint: string,
  //     _lowerHint: string
  //   ): Promise<any> => {
  //     return new Promise(async (resolve, reject) => {
  //       try {
  //         console.log("line-110")
  //         const contract = this.getContract(address);
  //         if (!contract) throw new Error("Contract initialization failed");
  //         console.log(
  //           "orivalues",
  //           _assetAmount,
  //           _THUSDAmount,
  //           _maxFeePercentage,
  //           recommendedFee,
  //           _upperHint,
  //           _lowerHint
  //         );
  //         console.log(
  //           "vasluesssssss",
  //           BigInt(_maxFeePercentage.toString()),
  //           BigInt(_THUSDAmount.toString()),
  //           BigInt(_assetAmount.toString()),
  //           BigInt(recommendedFee.toString())
  //         );

  //         const tx = await contract.openTrove(
  //           BigInt(_maxFeePercentage.toString()),
  //           BigInt(_THUSDAmount.toString()),
  //           BigInt(_assetAmount.toString()),
  //           _upperHint,
  //           _lowerHint,
  //           { value: BigInt(recommendedFee.toString()) }
  //         );

  //         // const tx = await contract.openTrove(
  //         //   // BigInt(_maxFeePercentage.toString()),
  //         //   '10000000000000000',
  //         //   // BigInt(_THUSDAmount.toString()),
  //         //  '1800000000000000000000',
  //         //   // BigInt(_assetAmount.toString()),
  //         //   "0",
  //         //   _upperHint,
  //         //   _lowerHint,
  //         //   // { value: BigInt(recommendedFee.toString()) }
  //         //   { value: '922551590000000000' }
  //         // );

  //         const receipt = await tx.wait();
  //         resolve(receipt);
  //       } catch (error: any) {
  //         reject(error.reason || error.data?.message || error.message || error);
  //       }
  //     });
  //   };

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
    address: any,
    _assetAmount: number | string,
    _upperHint: string,
    _lowerHint: string,
    _supplyAmount: number | string,
    provider: any
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = await provider.writeContract({
          address,
          abi: borrowerContractABI,
          functionName: "addColl",
          args: [BigInt(_supplyAmount.toString()), _upperHint, _lowerHint],
          gasLimit: BigInt("3000000"),
          // value: BigInt(_supplyAmount.toString()),
        });

        // const tx = await contract.write.addColl(
        //   [BigInt(_assetAmount.toString()), _upperHint, _lowerHint],
        //   {
        //     gasLimit: BigInt("3000000"),
        //     value: BigInt(_supplyAmount.toString()),
        //   }
        // );
        const receipt = tx;
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
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");
        const data = await contract.Troves(walletAddress);
        resolve(data);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error); // Handle errors properly
      }
    });
  };

  balanceOf = async (address: string, walletAddress: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");
        const data = await contract.balanceOf(walletAddress);
        resolve(data);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error); // Handle errors properly
      }
    });
  };

  closeTrove = async (address: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = this.getContract(address);
        if (!contract) throw new Error("Contract initialization failed");
        const data = await contract.closeTrove();
        const receipt = await data.wait();
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error); // Handle errors properly
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
        console.log(address, spender);
        const contract = this.getContract(address);
        console.log("line-406", contract);
        if (!contract) throw new Error("Contract initialization failed");

        const tx = await contract.approve(
          spender,
          ethers.BigNumber.from(amount)
        );
        console.log("line tx", tx);
        const receipt = await tx.wait();
        resolve(receipt);
      } catch (error: any) {
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
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  adjustTrove = async (
    address: any,
    _maxFeePercentage: number | string,
    _collWithdrawal: number | string,
    _THUSDChange: number | string,
    _isDebtIncrease: boolean,
    _assetAmount: number | string,
    _upperHint: string,
    _lowerHint: string,
    _supplyValue: number | string,
    provider: any
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = await provider.writeContract({
          address,
          abi: borrowerContractABI,
          functionName: "adjustTrove",
          args: [
            BigInt(_maxFeePercentage.toString()),
            BigInt(_supplyValue.toString()),
            BigInt(_THUSDChange.toString()),
            _isDebtIncrease,
            BigInt(_assetAmount.toString()),
            _upperHint,
            _lowerHint,
          ],
          gasLimit: BigInt("3000000"),
          // value: BigInt(_supplyValue.toString()),
        });

        // const tx = await contract?.write?.adjustTrove(
        //   [
        //     BigInt(_maxFeePercentage.toString()),
        //     BigInt(_collWithdrawal.toString()),
        //     BigInt(_THUSDChange.toString()),
        //     _isDebtIncrease,
        //     BigInt(_assetAmount.toString()),
        //     _upperHint,
        //     _lowerHint,
        //   ],
        //   {
        //     gasLimit: BigInt("3000000"),
        //     value: BigInt(_supplyValue.toString()),
        //   }
        // );
        const receipt = tx;
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  depositAndStakeCurve = async (
    address: string,
    _depositAddress: string,
    _lpTokenAddress: string,
    _gaugeAddress: string,
    _nCoins: number | string,
    _coinsAddress: string[],
    _amounts: string[],
    _minMinAmount: number | string,
    _userUnderlying: boolean,
    _useDynarray: boolean,
    _poolAddress: string,
    provider: any
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(
          "providerogggg",
          address,
          _depositAddress,
          _lpTokenAddress,
          _gaugeAddress,
          BigInt(_nCoins.toString()),
          _coinsAddress,
          _amounts.map((amount) => BigInt(amount.toString())),
          BigInt(_minMinAmount.toString()),
          _userUnderlying,
          _useDynarray,
          _poolAddress,
          provider
        );
        const tx = await provider.writeContract({
          address,
          abi: curveContractAbi,
          functionName: "deposit_and_stake",
          args: [
            _depositAddress,
            _lpTokenAddress,
            _gaugeAddress,
            BigInt(_nCoins.toString()),
            _coinsAddress,
            _amounts.map((amount) => BigInt(amount.toString())),
            BigInt(_minMinAmount.toString()),
            _userUnderlying,
            _useDynarray,
            _poolAddress,
          ],
          gasLimit: BigInt("3000000"),
        });

        console.log("transaction:", tx);
        const receipt = tx;
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  withdrawLPTokens = async (
    address: string,
    _withdrawAmount: number | string,
    provider: any
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(
          "providerogggg",
          address,
          BigInt(_withdrawAmount.toString()),
          provider
        );
        const tx = await provider.writeContract({
          address,
          abi: curveContractAbi,
          functionName: "withdraw",
          args: [
            BigInt(_withdrawAmount.toString()),
          ],
          gasLimit: BigInt("3000000"),
        });

        console.log("transaction:", tx);
        const receipt = tx;
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };

  unstakeLPTokens = async (
    address: string,
    PoolAddress: string,
    _burnAmount: number | string,
    _amounts: string[],
    provider: any
  ): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(
          "providerogggg",
          address,
          PoolAddress,
          BigInt(_burnAmount.toString()),
          _amounts.map((amount) => BigInt(amount.toString())),
          provider
        );
        const tx = await provider.writeContract({
          address,
          abi: curveContractAbi,
          functionName: "remove_liquidity",
          args: [
            PoolAddress,
            BigInt(_burnAmount.toString()),
            _amounts.map((amount) => BigInt(amount.toString())),
          ],
          gasLimit: BigInt("3000000"),
        });

        console.log("transaction:", tx);
        const receipt = tx;
        resolve(receipt);
      } catch (error: any) {
        reject(error.reason || error.data?.message || error.message || error);
      }
    });
  };
}

export default Web3Interaction;
