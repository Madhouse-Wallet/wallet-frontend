
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
export const base64ToBuffer = (base64) =>
    Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));