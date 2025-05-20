// Import ABIs
import { Contract, ethers } from "ethers";

class Web3Interaction {
  private PROVIDER: any;
  private SIGNER: any;
  private USDC_ABI: any;
  
  constructor(currentNetwork?: any, provider?: any) {
    if (provider) {
      this.PROVIDER = provider;
      this.SIGNER = this.PROVIDER.getSigner();
    }
      this.USDC_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "spender",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "owner",
        "type": "address"
      },
      {
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
  }

  handleUSDCApproval = async (
    usdcAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: string | number,
  ): Promise<{ success: boolean; allowance?: string; error?: string }> => {
    return new Promise((resolve, reject) => {
      try {
        // Create contract instance
        const contract = new ethers.Contract(
          usdcAddress,
          this.USDC_ABI,
          this.SIGNER
        );

        // Check current allowance
        const currentAllowance = contract.allowance(
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
          const newAllowance = contract.allowance(
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
    return new Promise((resolve) => {
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
         this.handleUSDCApproval(
            usdcAddress,
            ownerAddress,
            recipientAddress,
            amount
          ).then((approvalResult) => {

            if (!approvalResult.success) {
              resolve({
                success: false,
                error: `Approval failed: ${approvalResult.error}`,
              });
              return;
            }
          });
        }

        // Create USDC contract instance
        const usdcContract = new Contract(usdcAddress, this.USDC_ABI, signer);
        // Perform the transfer
        const tx = usdcContract.transfer(recipientAddress, usdcAmount);
        tx.wait(); // Wait for transaction confirmation
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
    return new Promise((resolve) => {
      try {
        // Create USDC contract instance
        const usdcContract = new Contract(usdcAddress, this.USDC_ABI, provider);

        // Get balance
        const balanceWei = usdcContract.balanceOf(accountAddress);

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
