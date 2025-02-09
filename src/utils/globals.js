
export const splitAddress = (address, charDisplayed = 6) => {
    const firstPart = address.slice(0, charDisplayed);
    const lastPart = address.slice(-charDisplayed);
    return `${firstPart}...${lastPart}`;
};

export const generateOTP = (length) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};  // Utility to encode and decode Base64
export const bufferToBase64 = (buffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buffer)));
export const base64ToBuffer = (base64) => {
    try {
        // Check if the input string is valid Base64
        if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64.replace(/-/g, '+').replace(/_/g, '/'))) {
            throw new Error('Invalid Base64 string');
        }

        // Adjust for URL-safe Base64
        const adjustedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');

        // Decode the adjusted Base64 string
        const binaryString = atob(adjustedBase64);

        // Convert to Uint8Array
        return Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    } catch (e) {
        console.error('Failed to decode Base64 string:', e.message);
        return null; // Handle error as needed (e.g., return an empty buffer or throw an error)
    }
};

export const storedataLocalStorage = async (data, name) => {
    try {
        localStorage.setItem(name, JSON.stringify(data));
        return true
    } catch (error) {
        console.log("storedataLocalStorage error--->", error)
        return true
    }
}

export const logoutStorage = async () => {
    try {
        localStorage.removeItem("authUser");
        localStorage.clear();   
        return true
    } catch (error) {
        console.log("storedataLocalStorage error--->", error)
        return true
    }
}

export const webAuthKeyStore = async (webAuthnKey) => {
    try {
        return {
            authenticatorId: (webAuthnKey.authenticatorId),
            authenticatorIdHash: (webAuthnKey.authenticatorIdHash),
            pubX: BigInt(webAuthnKey.pubX).toString(),
            pubY: BigInt(webAuthnKey.pubY).toString(),
            rpID: "",
        }
    } catch (error) {
        console.log("webAuthKeyStore error -->",error)
    }
}

export const isValidEmail = async (email) => {
    // Define the email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Test the email against the regex
    return emailRegex.test(email);
}