// api-service.js
import axios from "axios";

// Base configuration for SphereAPI
const BASE_URL = process.env.NEXT_PUBLIC_SPHEREPAY_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_SPHEREPAY_API_SECRET; // Consider using environment variables

// Create axios instance with default config
const sphereAPIClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  maxBodyLength: Infinity,
});

const sphereAPIClien2 = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  maxBodyLength: Infinity,
});

// Error handler function
const handleError = (error) => {
  // You can customize error handling logic here
  console.error("API Error:", error);
  throw error;
};

/**
 * SpherePayAPI service object with methods for different endpoints
 */
const SpherePayAPI = {
  /**
   * Create a new customer
   * @param {Object} customerData - Customer details
   * @returns {Promise} API response
   */
  createCustomer: async (customerData) => {
    try {
      const response = await sphereAPIClient.post("/v1/customer", customerData);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get customer details by ID
   * @param {string} customerId - Customer ID
   * @returns {Promise} API response
   */
  getCustomer: async (customerId) => {
    try {
      const response = await sphereAPIClient.get(`/v1/customer/${customerId}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create Terms of Service link for a customer
   * @param {string} customerId - Customer ID
   * @returns {Promise} API response with TOS link details
   */
  createTosLink: async (customerId) => {
    try {
      const response = await sphereAPIClient.post(
        `/v2/customer/${customerId}/tos-link`
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create KYC (Know Your Customer) link for a customer
   * @param {string} customerId - Customer ID
   * @returns {Promise} API response with KYC link details
   */
  createKycLink: async (customerId) => {
    try {
      const response = await sphereAPIClient.post(
        `/v2/customer/${customerId}/kyc-link`
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Add a wallet for a customer
   * @param {Object} walletData - Wallet details
   * @param {string} walletData.customer - Customer ID
   * @param {string} walletData.network - Blockchain network (e.g., "sol")
   * @param {string} walletData.address - Wallet address
   * @returns {Promise} API response with wallet details
   */
  addWallet: async (walletData) => {
    try {
      const response = await sphereAPIClient.post("/v1/wallet", walletData);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Add a bank account for a customer
   * @param {string} customerId - Customer ID
   * @param {Object} bankAccountData - Bank account details
   * @param {string} bankAccountData.customer - Customer ID (same as customerId)
   * @param {string} bankAccountData.accountName - Name of the bank account
   * @param {string} bankAccountData.bankName - Name of the bank
   * @param {string} bankAccountData.accountType - Type of account (e.g., "checking", "savings")
   * @param {string} bankAccountData.accountNumber - Bank account number
   * @param {string} bankAccountData.routingNumber - Bank routing number
   * @returns {Promise} API response with bank account details
   */
  addBankAccount: async (customerId, bankAccountData) => {
    try {
      const response = await sphereAPIClient.post(
        // `/v2/customer/${customerId}/bank-account`,
        `/v1/bankAccount`,
        bankAccountData
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  deletebankAccount: async (id) => {
    try {
      const response = await sphereAPIClient.delete(`/v1/bankAccount/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Initiate a transfer between a source and destination
   * @param {Object} transferData - Transfer details
   * @param {string} transferData.customer - Customer ID
   * @param {string} transferData.amount - Amount to transfer
   * @param {Object} transferData.source - Source details
   * @param {string} transferData.source.id - Source ID (e.g., bank account ID)
   * @param {string} transferData.source.network - Source network (e.g., "wire")
   * @param {string} transferData.source.currency - Source currency (e.g., "usd")
   * @param {Object} transferData.destination - Destination details
   * @param {string} transferData.destination.id - Destination ID (e.g., wallet ID)
   * @param {string} transferData.destination.network - Destination network (e.g., "sol")
   * @param {string} transferData.destination.currency - Destination currency (e.g., "usdc")
   * @returns {Promise} API response with transfer details
   */
  createTransfer: async (transferData) => {
    try {
      const response = await sphereAPIClient.post("/v1/transfer", transferData);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Initiate a crypto-to-fiat transfer (from wallet to bank account)
   * @param {Object} transferData - Transfer details
   * @param {string} transferData.customer - Customer ID
   * @param {string} transferData.amount - Amount to transfer
   * @param {Object} transferData.source - Source details
   * @param {string} transferData.source.id - Source wallet ID
   * @param {string} transferData.source.network - Source network (e.g., "sol")
   * @param {string} transferData.source.currency - Source currency (e.g., "usdc")
   * @param {Object} transferData.destination - Destination details
   * @param {string} transferData.destination.id - Destination bank account ID
   * @param {string} transferData.destination.network - Destination network (e.g., "wire")
   * @param {string} transferData.destination.currency - Destination currency (e.g., "usd")
   * @returns {Promise} API response with transfer details
   */
  createWalletToBankTransfer: async (transferData) => {
    try {
      const response = await sphereAPIClient.post("/v1/transfer", transferData);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  getBankAccountDetail: async (customerId) => {
    try {
      const response = await sphereAPIClient.get(
        `/v1/bankAccount/${customerId}`
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  getTransferDetail: async () => {
    try {
      const response = await sphereAPIClient.get(`/v1/transfer`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  transferFee: async (feeData) => {
    try {
      const response = await sphereAPIClient.post(`/v1/transfer/fee`, feeData);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};

export default SpherePayAPI;
