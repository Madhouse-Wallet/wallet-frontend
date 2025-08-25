import CryptoJS from 'crypto-js';

export const splitAddress = (address, charDisplayed = 6) => {
  const firstPart = address.slice(0, charDisplayed);
  const lastPart = address.slice(-charDisplayed);
  return `${firstPart}...${lastPart}`;
};

export const generateOTP = (length) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}; // Utility to encode and decode Base64
export const bufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));
export const base64ToBuffer = (base64) => {
  try {
    // Check if the input string is valid Base64
    if (
      !/^[A-Za-z0-9+/]+={0,2}$/.test(
        base64.replace(/-/g, "+").replace(/_/g, "/")
      )
    ) {
      throw new Error("Invalid Base64 string");
    }

    // Adjust for URL-safe Base64
    const adjustedBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");

    // Decode the adjusted Base64 string
    const binaryString = atob(adjustedBase64);

    // Convert to Uint8Array
    return Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
  } catch (e) {
    console.error("Failed to decode Base64 string:", e.message);
    return null; // Handle error as needed (e.g., return an empty buffer or throw an error)
  }
};

export const storedataLocalStorage = async (data, name) => {
  try {
    localStorage.setItem(name, JSON.stringify(data));
    return true;
  } catch (error) {
    console.log("storedataLocalStorage error--->", error);
    return true;
  }
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const logoutStorage = async () => {
  try {
    localStorage.removeItem("authUser");
    localStorage.clear();
    return true;
  } catch (error) {
    console.log("storedataLocalStorage error--->", error);
    return true;
  }
};

export const webAuthKeyStore = async (webAuthnKey) => {
  try {
    return {
      authenticatorId: webAuthnKey.authenticatorId,
      authenticatorIdHash: webAuthnKey.authenticatorIdHash,
      pubX: BigInt(webAuthnKey.pubX).toString(),
      pubY: BigInt(webAuthnKey.pubY).toString(),
      rpID: "",
    };
  } catch (error) {
    console.log("webAuthKeyStore error -->", error);
  }
};

export const isValidEmail = async (email) => {
  // Define the email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Test the email against the regex
  return emailRegex.test(email);
};

export const getRandomString = async (length = 4) => {
  const randomAlpha = await Array.from(
    { length },
    () => String.fromCharCode(97 + Math.floor(Math.random() * 26)) // a–z
  ).join("");
  return randomAlpha;
};

export const calcLnToChainFeeWithSwapAmount = async (swapAmount = 0) => {
  try {
    const boltzFeePercent = 0.5; // e.g. 0.5% Boltz fee (replace with actual)
    const lockupFee = 500; // On-chain lockup fee in sats
    const claimFee = 1000; // Fixed on-chain claim fee in sats
    const boltzFee = Math.floor((swapAmount * boltzFeePercent) / 100);
    const totalFees = boltzFee + lockupFee + claimFee;
    const platformFee = lockupFee + claimFee;
    const amountReceived = swapAmount - totalFees;

    // Convert to Uint8Array
    return {
      boltzFee,
      platformFee,
      lockupFee,
      claimFee,
      totalFees,
      amountReceived,
      swapAmount,
    };
  } catch (e) {
    console.error("error with calcLnToChainFeeWithSwapAmount", e);
    return null; // Handle error as needed (e.g., return an empty buffer or throw an error)
  }
};

export const calcLnToChainFeeWithReceivedAmount = async (
  amountReceived = 0
) => {
  try {
    const boltzFeePercent = 0.5; // e.g. 0.5% Boltz fee (replace with actual)
    const lockupFee = 500; // On-chain lockup fee in sats
    const claimFee = 1000; // Fixed on-chain claim fee in sats

    const feeFactor = 1 - boltzFeePercent / 100;
    const swapAmount = Math.ceil(
      (amountReceived + lockupFee + claimFee) / feeFactor
    );

    const boltzFee = Math.floor((swapAmount * boltzFeePercent) / 100);
    const totalFees = boltzFee + lockupFee + claimFee;
    const platformFee = lockupFee + claimFee;

    // Convert to Uint8Array
    return {
      boltzFee,
      platformFee,
      lockupFee,
      claimFee,
      totalFees,
      amountReceived,
      swapAmount,
    };
  } catch (e) {
    console.error("error with calcLnToChainFeeWithReceivedAmount", e);
    return null; // Handle error as needed (e.g., return an empty buffer or throw an error)
  }
};

export const calcFeeOnchainToLnWithReceiveAmount = async (
  amount,
  lockupFee = 0
) => {
  const boltzFeePercent = 0.5; // 0.5%
  const claimFee = 500; // fixed onchain claim tx fee in sats

  const boltzFee = Math.floor((amount * boltzFeePercent) / 100);
  const totalFees = boltzFee + claimFee + lockupFee;
  const onchainPayment = amount + totalFees;

  return {
    receiveAmount: amount,
    boltzFee,
    claimFee,
    lockupFee,
    totalFees,
    onchainPayment,
  };
};

export const encryptData = async(data) => {
  const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY; // Store in env
  return CryptoJS.AES.encrypt(data.toString(), SECRET_KEY).toString();
};
