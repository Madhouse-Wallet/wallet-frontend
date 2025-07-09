import axios, { AxiosError } from "axios";

// Response interfaces
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
const FIXED_IP_ADDRESS = process.env.NEXT_PUBLIC_IP_ADDRESS;

/**
 * Combined function to create a USDC to BTC fixed shift in one call
 * @param usdcAmount - Amount of USDC to convert
 * @param bitcoinAddress - Bitcoin address to receive BTC
 * @param secretKey - SideShift API secret key
 * @param affiliateId - SideShift affiliate ID
 * @returns The shift response containing deposit address and other details
 */
export const createUsdcToBtcShift = async (
  usdcAmount: string,
  bitcoinAddress: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "USDC",
        depositNetwork: "base",
        settleCoin: "BTC",
        settleNetwork: "bitcoin",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: bitcoinAddress,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createBtcToTbtcShift = async (
  usdcAmount: string,
  bitcoinAddress: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "BTC",
        depositNetwork: "bitcoin",
        settleCoin: "TBTC",
        settleNetwork: "base",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: bitcoinAddress,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createTBtcToLbtcShift = async (
  usdcAmount: string,
  bitcoinAddress: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "TBTC",
        depositNetwork: "base",
        settleCoin: "BTC",
        settleNetwork: "liquid",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: bitcoinAddress,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createLBtcToTbtcShift = async (
  usdcAmount: string,
  bitcoinAddress: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "BTC",
        depositNetwork: "liquid",
        settleCoin: "TBTC",
        settleNetwork: "base",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: bitcoinAddress,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createLBtcToUSDCShift = async (
  usdcAmount: string,
  bitcoinAddress: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "BTC",
        depositNetwork: "liquid",
        settleCoin: "USDC",
        settleNetwork: "base",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: bitcoinAddress,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createBtcToUsdcShift = async (
  usdcAmount: string,
  bitcoinAddress: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "BTC",
        depositNetwork: "bitcoin",
        settleCoin: "USDC",
        settleNetwork: "base",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: bitcoinAddress,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createUsdcBaseToGoldShift = async (
  usdcAmount: string,
  bitcoinAddress: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "USDC",
        depositNetwork: "base",
        settleCoin: "XAUT",
        settleNetwork: "ethereum",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: bitcoinAddress,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createGoldToUsdcBaseShift = async (
  usdcAmount: string,
  bitcoinAddress: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "XAUT",
        depositNetwork: "ethereum",
        settleCoin: "USDC",
        settleNetwork: "base",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: bitcoinAddress,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createUsdcBaseToEthMainnetShift = async (
  usdcAmount: string,
  bitcoinAddress: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "USDC",
        depositNetwork: "base",
        settleCoin: "eth",
        settleNetwork: "ethereum",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: bitcoinAddress,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createEthMainnetToUsdcbaseShift = async (
  usdcAmount: string,
  bitcoinAddress: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "eth",
        depositNetwork: "ethereum",
        settleCoin: "USDC",
        settleNetwork: "base",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: bitcoinAddress,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createLbtcToUsdcShift = async (
  btcAmount: string,
  userBaseWallet: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "BTC",
        depositNetwork: "liquid",
        settleCoin: "USDC",
        settleNetwork: "base",
        depositAmount: btcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: userBaseWallet,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};



export const createLbtcToUsdcShiftWithdraw = async (
  btcAmount: string,
  userBaseWallet: string,
  secretKey: string,
  affiliateId: string,
  refundAddress: string,
  boltzSwapId: string
): Promise<ShiftResponse> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        "depositCoin": "btc",
        "depositNetwork": "liquid",
        "settleCoin": "usdc",
        "settleNetwork": "base",
        "settleAmount": null,
        depositAmount: btcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;

    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: userBaseWallet,
        affiliateId,
        quoteId: quoteData.id,
        "refundAddress": refundAddress,
        "refundMemo": `Failed to settle shift for Wallet Address: ${userBaseWallet} Boltz Reverse Swap ID: ${boltzSwapId}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};



export const createUsdcToLbtcToShiftQuote = async (
  usdcAmount: string,
  secretKey: string,
  affiliateId: string
): Promise<any> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "USDC",
        depositNetwork: "base",
        settleCoin: "BTC",
        settleNetwork: "liquid",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;
    return quoteData;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createLbtcToUsdcShiftQuote = async (
  usdcAmount: string,
  secretKey: string,
  affiliateId: string
): Promise<any> => {
  try {
    // Step 1: Request a quote
    const quoteResponse = await axios.post<QuoteResponse>(
      "https://sideshift.ai/api/v2/quotes",
      {
        affiliateId,
        depositCoin: "BTC",
        depositNetwork: "liquid",
        settleCoin: "USDC",
        settleNetwork: "base",
        depositAmount: usdcAmount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    const quoteData = quoteResponse.data;
    return quoteData;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};

export const createUsdcToLbtcToShiftFixed = async (
  quoteData: any,
  userLbtcWallet: string,
  secretKey: string,
  affiliateId: string
): Promise<ShiftResponse> => {
  try {
    // Step 2: Create a fixed shift using the quote
    const shiftResponse = await axios.post<ShiftResponse>(
      "https://sideshift.ai/api/v2/shifts/fixed",
      {
        settleAddress: userLbtcWallet,
        affiliateId,
        quoteId: quoteData.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-sideshift-secret": secretKey,
          "x-user-ip": FIXED_IP_ADDRESS,
        },
      }
    );

    return shiftResponse.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "SideShift API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        `SideShift operation failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    throw error;
  }
};
