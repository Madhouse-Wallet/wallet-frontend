// Import ABIs
import borrowerContractABI from "../../borrowerContract.json";
import { Contract, ethers } from "ethers";
import fetchPriceAbi from "../../fetchPriceContractAbi.json";
import USDC_ABI from "../../usdcAbi.json";

// Namehash implementation (unchanged)
function namehash(name: any) {
  let node =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

  if (name) {
    const labels = name.split(".");
    for (let i = labels.length - 1; i >= 0; i--) {
      node = ethers.utils.keccak256(
        ethers.utils.concat([
          ethers.utils.arrayify(node),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes(labels[i])),
        ])
      );
    }
  }
  return node;
}
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

      // getBalanceWithSigner();
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

  handleUSDCApproval = async (
    usdcAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: string | number,
    provider: any
  ): Promise<{ success: boolean; allowance?: string; error?: string }> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Create contract instance
        const contract = new ethers.Contract(
          usdcAddress,
          USDC_ABI,
          this.SIGNER
        );

        // Check current allowance
        const currentAllowance = await contract.allowance(
          ownerAddress,
          spenderAddress
        );

        // Convert amount to BigNumber for comparison
        const amountBN = ethers.BigNumber.from(amount.toString());

        // If current allowance is sufficient, return success
        if (currentAllowance.gte(amountBN)) {
          resolve({
            success: true,
            allowance: currentAllowance.toString(),
          });
          return;
        }

        // If allowance is insufficient, approve
        try {
          const tx = await provider.writeContract({
            address: usdcAddress,
            abi: USDC_ABI,
            functionName: "approve",
            args: [spenderAddress, BigInt(amount.toString())],
            gasLimit: BigInt("3000000"),
          });

          console.log("Approval transaction:", tx);

          // Check allowance again after approval
          const newAllowance = await contract.allowance(
            ownerAddress,
            spenderAddress
          );

          resolve({
            success: true,
            allowance: newAllowance.toString(),
          });
        } catch (approvalError: any) {
          resolve({
            success: false,
            error:
              approvalError.reason ||
              approvalError.data?.message ||
              approvalError.message ||
              "Approval failed",
            allowance: currentAllowance.toString(),
          });
        }
      } catch (error: any) {
        resolve({
          success: false,
          error:
            error.reason ||
            error.data?.message ||
            error.message ||
            "Operation failed",
        });
      }
    });
  };

  // // Send USDC function
  // sendUSDC = async (
  //   usdcAddress: string,
  //   recipientAddress: string,
  //   amount: string | number,
  //   provider: any,
  //   ownerAddress?: string
  // ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       // If ownerAddress is provided, check/handle approval first
  //       if (ownerAddress) {
  //         const approvalResult = await this.handleUSDCApproval(
  //           usdcAddress,
  //           ownerAddress,
  //           recipientAddress,
  //           amount,
  //           provider
  //         );

  //         if (!approvalResult.success) {
  //           resolve({
  //             success: false,
  //             error: `Approval failed: ${approvalResult.error}`
  //           });
  //           return;
  //         }
  //       }

  //       // Perform the transfer
  //       try {
  //         const tx = await provider.writeContract({
  //           address: usdcAddress,
  //           abi: USDC_ABI,
  //           functionName: "transfer",
  //           args: [recipientAddress, BigInt(amount.toString())],
  //           gasLimit: BigInt("3000000"),
  //         });

  //         console.log("Transfer transaction:", tx);

  //         resolve({
  //           success: true,
  //           txHash: tx
  //         });
  //       } catch (transferError: any) {
  //         resolve({
  //           success: false,
  //           error: transferError.reason || transferError.data?.message || transferError.message || "Transfer failed"
  //         });
  //       }
  //     } catch (error: any) {
  //       resolve({
  //         success: false,
  //         error: error.reason || error.data?.message || error.message || "Operation failed"
  //       });
  //     }
  //   });
  // };

  // Send USDC function
  sendUSDC = async (
    usdcAddress: string,
    recipientAddress: string,
    amount: string | number,
    provider: ethers.providers.Web3Provider, // Ensure this is a valid Web3Provider
    ownerAddress?: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    return new Promise(async (resolve) => {
      try {
        console.log("line--------");
        // Convert amount to BigNumber (assuming USDC has 6 decimals)
        const usdcAmount = ethers.utils.parseUnits(amount.toString(), 18);

        // Ensure the provider has a signer
        const signer = provider.getSigner();
        if (!signer) {
          resolve({ success: false, error: "No signer found in provider" });
          return;
        }

        // Handle approval if ownerAddress is provided
        console.log("ownerAddress---->", ownerAddress);
        if (ownerAddress) {
          const approvalResult = await this.handleUSDCApproval(
            usdcAddress,
            ownerAddress,
            recipientAddress,
            amount,
            provider
          );

          if (!approvalResult.success) {
            resolve({
              success: false,
              error: `Approval failed: ${approvalResult.error}`,
            });
            return;
          }
        }

        // Create USDC contract instance
        const usdcContract = new Contract(usdcAddress, USDC_ABI, signer);
        console.log("usdcContract-->", usdcContract);
        // Perform the transfer
        const tx = await usdcContract.transfer(recipientAddress, usdcAmount);
        await tx.wait(); // Wait for transaction confirmation

        console.log("Transfer transaction:", tx);

        resolve({
          success: true,
          txHash: tx.hash,
        });
      } catch (error: any) {
        console.log("error--r>", error);
        resolve({
          success: false,
          error:
            error.reason ||
            error.data?.message ||
            error.message ||
            "Transfer failed",
        });
      }
    });
  };

  // First, let's define the balance fetching function in Web3Interaction class
  getUSDCBalance = async (
    usdcAddress: string,
    accountAddress: string,
    provider: ethers.providers.Web3Provider
  ): Promise<{ success: boolean; balance?: string; error?: string }> => {
    return new Promise(async (resolve) => {
      try {
        // Create USDC contract instance
        const usdcContract = new Contract(usdcAddress, USDC_ABI, provider);

        // Get balance
        const balanceWei = await usdcContract.balanceOf(accountAddress);

        // Convert balance to human readable format (6 decimals for USDC)
        const balance = ethers.utils.formatUnits(balanceWei, 6);

        resolve({
          success: true,
          balance,
        });
      } catch (error: any) {
        resolve({
          success: false,
          error:
            error.reason ||
            error.data?.message ||
            error.message ||
            "Failed to fetch balance",
        });
      }
    });
  };
}

export default Web3Interaction;
