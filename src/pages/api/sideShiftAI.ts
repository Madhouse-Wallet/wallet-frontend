// This would go in a separate file, e.g., utils/sideshift-api.ts

import axios, { AxiosError } from "axios";

interface QuoteRequest {
  affiliateId: string;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  depositAmount: string;
}

interface QuoteResponse {
  id: string;
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  depositAmount: string;
  settleAmount: string;
  rate: string;
  expiresAt: string;
}

interface ShiftRequest {
  settleAddress: string;
  affiliateId: string;
  quoteId: string;
}

interface ShiftResponse {
  id: string;
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  depositAddress: string;
  settleAddress: string;
  depositAmount: string;
  settleAmount: string;
  status: string;
  expiresAt: string;
}

// Fixed IP address as used in curl commands
const FIXED_IP_ADDRESS = "201.144.119.146";

/**
 * Request a quote from the SideShift API
 */
export const requestQuote = async (
  quoteParams: QuoteRequest,
  secretKey: string
): Promise<QuoteResponse> => {
  try {
    const response = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      quoteParams,
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Quote Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `Quote request failed: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
};

/**
 * Create a fixed shift using a previously obtained quote
 */
export const createFixedShift = async (
  shiftParams: ShiftRequest,
  secretKey: string
): Promise<ShiftResponse> => {
  try {
    const response = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      shiftParams,
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Shift Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `Fixed shift creation failed: ${error.response?.data?.message || error.message}`
      );
    }
    throw error;
  }
};
