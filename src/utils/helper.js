import { ethers } from "ethers";

/**
 * Checks if input contains invalid characters for an address
 * @param {string} input - The input string to check
 * @returns {boolean} - True if input contains invalid characters, false if allowed
 */
export function hasInvalidCharacters(input) {
  if (!input || typeof input !== "string") {
    return true;
  }

  // Regex to check for invalid characters
  // Allows only: 0-9, a-f, A-F, and 'x' (for 0x prefix)
  const invalidCharsRegex = /[^0-9a-fA-Fx]/;

  return invalidCharsRegex.test(input);
}

/**
 * Validates if the address is a valid Ethereum/Base chain address
 * @param {string} address - The address string to validate
 * @returns {boolean} - True if valid address, false otherwise
 */
export function isValidAddress(address) {
  try {
    if (!address || typeof address !== "string") {
      return false;
    }

    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
}

export function filterAmountInput(value, decimalPlaces = 18) {
  if (!value || typeof value !== "string") {
    return "";
  }

  // Remove all invalid characters (keep only digits and one decimal point)
  let filtered;

  if (decimalPlaces === 0) {
    filtered = value.replace(/[^0-9]/g, "");
  } else {
    filtered = value.replace(/[^0-9.]/g, "");
  }

  // Handle multiple decimal points - keep only the first one
  const parts = filtered.split(".");
  if (parts.length > 2) {
    filtered = parts[0] + "." + parts.slice(1).join("");
  }

  // Limit decimal places
  if (parts.length === 2 && parts[1].length > decimalPlaces) {
    filtered = parts[0] + "." + parts[1].substring(0, decimalPlaces);
  }

  // Prevent leading zeros (except for values like 0.123)
  if (filtered.length > 1 && filtered[0] === "0" && filtered[1] !== ".") {
    filtered = filtered.substring(1);
  }

  return filtered;
}

export function isValidBitcoinAddress(address) {
  try {
    if (!address || typeof address !== "string") {
      return false;
    }

    const trimmedAddress = address.trim();

    // Reject obviously invalid addresses
    if (trimmedAddress.length < 26 || trimmedAddress.length > 62) {
      return false;
    }

    // Bitcoin address patterns with more comprehensive validation
    const patterns = {
      // Legacy addresses (P2PKH) - start with 1
      legacy: /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/,

      // Script addresses (P2SH) - start with 3
      script: /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/,

      // Bech32 SegWit addresses (P2WPKH) - start with bc1, 42 chars total
      bech32_p2wpkh: /^bc1[02-9ac-hj-np-z]{39}$/,

      // Bech32 SegWit addresses (P2WSH) - start with bc1, 62 chars total
      bech32_p2wsh: /^bc1[02-9ac-hj-np-z]{59}$/,

      // Taproot addresses (P2TR) - start with bc1p, 62 chars total
      taproot: /^bc1p[02-9ac-hj-np-z]{58}$/,
    };

    // Check if address matches any Bitcoin address pattern
    const isValidPattern = Object.values(patterns).some((pattern) =>
      pattern.test(trimmedAddress)
    );

    if (!isValidPattern) {
      return false;
    }

    // Additional validation for bech32 addresses (basic checksum concept)
    if (trimmedAddress.startsWith("bc1")) {
      // Ensure no invalid bech32 characters (1, b, i, o are not allowed after bc1)
      const bech32Part = trimmedAddress.slice(3); // Remove 'bc1' prefix
      const invalidBech32Chars = /[1bio]/i;
      if (invalidBech32Chars.test(bech32Part)) {
        return false;
      }
    }

    // Additional validation for Base58 addresses
    if (trimmedAddress.startsWith("1") || trimmedAddress.startsWith("3")) {
      // Ensure no invalid Base58 characters (0, O, I, l are not allowed)
      const invalidBase58Chars = /[0OIl]/;
      if (invalidBase58Chars.test(trimmedAddress)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Additional helper function to identify Bitcoin address type
export function getBitcoinAddressType(address) {
  if (!isValidBitcoinAddress(address)) {
    return "invalid";
  }

  const trimmed = address.trim();

  if (trimmed.startsWith("bc1p")) {
    return "taproot"; // P2TR
  } else if (trimmed.startsWith("bc1") && trimmed.length === 42) {
    return "bech32_p2wpkh"; // Native SegWit P2WPKH
  } else if (trimmed.startsWith("bc1") && trimmed.length === 62) {
    return "bech32_p2wsh"; // Native SegWit P2WSH
  } else if (trimmed.startsWith("3")) {
    return "script"; // P2SH (can be SegWit or non-SegWit)
  } else if (trimmed.startsWith("1")) {
    return "legacy"; // P2PKH
  }

  return "unknown";
}
