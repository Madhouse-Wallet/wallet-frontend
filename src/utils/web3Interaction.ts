// Import ABIs
import { Contract, ethers } from "ethers";
import USDC_ABI from "../../usdcAbi.json";

class Web3Interaction {
  private PROVIDER: any;
  private SIGNER: any;

  constructor(currentNetwork?: any, provider?: any) {
    if (provider) {
      this.PROVIDER = provider;
      this.SIGNER = this.PROVIDER.getSigner();
    }
  }


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
        // Convert amount to BigNumber (assuming USDC has 6 decimals)
        const usdcAmount = ethers.utils.parseUnits(amount.toString(), 18);

        // Ensure the provider has a signer
        const signer = provider.getSigner();
        if (!signer) {
          resolve({ success: false, error: "No signer found in provider" });
          return;
        }

        // Handle approval if ownerAddress is provided
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
        // Perform the transfer
        const tx = await usdcContract.transfer(recipientAddress, usdcAmount);
        await tx.wait(); // Wait for transaction confirmation
        resolve({
          success: true,
          txHash: tx.hash,
        });
      } catch (error: any) {
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
