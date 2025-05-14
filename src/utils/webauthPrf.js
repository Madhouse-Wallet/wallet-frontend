
// Helper functions


// Generate a random challenge (would normally come from a server)
function generateChallenge() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return array.buffer;
}

// Convert various formats
function bufferToBase64(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Generate a random 16-byte user ID
function generateUserId() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return array;
}

// Simple encryption using AES-GCM with PRF-derived key
const encryptData = async (data, derivedKey) => {
    try {
        const encodedData = new TextEncoder().encode(data);

        // Generate a random IV
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Import the PRF output as an AES key
        const key = await window.crypto.subtle.importKey(
            "raw",
            derivedKey,
            { name: "AES-GCM" },
            false,
            ["encrypt"]
        );

        // Encrypt the data
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encodedData
        );

        // Combine IV and encrypted data for storage
        const result = {
            iv: bufferToBase64(iv),
            data: bufferToBase64(encryptedData)
        };

        return result;
    } catch (error) {
        throw error;
    }
}

// Decrypt data using AES-GCM with PRF-derived key
const decryptData = async (encryptedObject, derivedKey) => {
    try {
        const iv = base64ToBuffer(encryptedObject.iv);
        const encryptedData = base64ToBuffer(encryptedObject.data);

        // Import the PRF output as an AES key
        const key = await window.crypto.subtle.importKey(
            "raw",
            derivedKey,
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        // Decrypt the data
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encryptedData
        );

        // Decode the result back to a string
        return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
        throw error;
    }
}

// Register a new WebAuthn credential with PRF extension
export const registerCredential = async (username, displayName) => {
    try {
        const credentialCreationOptions = {
            publicKey: {
                rp: { name: "WebAuthn PRF Demo" },
                user: {
                    id: generateUserId(),
                    name: username,
                    displayName: displayName
                },
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 }, // ES256
                    { type: "public-key", alg: -257 } // RS256
                ],
                timeout: 60000,
                // authenticatorSelection: {
                //     userVerification: "preferred",
                //     authenticatorAttachment: "platform", // Use platform authenticator if available
                //     residentKey: "required",
                //     requireResidentKey: true
                // },
                authenticatorSelection: {
                    userVerification: "required",
                    residentKey: "required",           // Allow discoverable credentials
                    //authenticatorAttachment: "cross-platform", // Use platform authenticator if available
                    requireResidentKey: true           // Broader device support
                    // No authenticatorAttachment to support both platform & cross-platform
                },
                extensions: { prf: {} }, // Request PRF extension
                challenge: generateChallenge()
            }
        };

        const credential = await navigator.credentials.create(credentialCreationOptions);
        const extensionResults = credential.getClientExtensionResults();

        // Check if PRF is supported
        if (!extensionResults.prf || extensionResults.prf.enabled !== true) {
            return {
                status: false,
                msg: "PRF extension not supported by this authenticator"
            }
        }
        return {
            status: true,
            data: {
                credentialId: bufferToBase64(credential.rawId)
            }
        }
    } catch (error) {
        console.error('registerCheck error-->', error?.name, error);
        return {
            status: false,
            msg: error.message
        }
    }
}

// Encrypt and store a secret using WebAuthn PRF
export const storeSecret = async (credentialIdBase, data) => {
    const context = "secret data";
    const secretValue = data;
    const outputElement = document.getElementById('storeOutput');
    try {
        // Get stored credential ID or use empty to try discoverable credentials
        let credentialId;
        const storedCredentialId = credentialIdBase;
        if (storedCredentialId) {
            credentialId = base64ToBuffer(storedCredentialId);
        }

        // Prepare context for PRF
        const contextBuffer = new TextEncoder().encode(context);

        const authOptions = {
            publicKey: {
                timeout: 60000,
                challenge: generateChallenge(),
                allowCredentials: credentialId ? [
                    {
                        id: credentialId,
                        type: 'public-key'
                    }
                ] : [],
                userVerification: "required",
                extensions: {
                    prf: {
                        eval: {
                            first: contextBuffer
                        }
                    }
                }
            }
        };

        const assertion = await navigator.credentials.get(authOptions);
        const extensionResults = assertion.getClientExtensionResults();

        // Ensure PRF result is available
        if (!extensionResults.prf || !extensionResults.prf.results || !extensionResults.prf.results.first) {
            return {
                status: false,
                msg: "PRF result not available"
            }
        }

        const prfResult = extensionResults.prf.results.first;


        // Use the PRF output to encrypt the secret
        const encryptedData = await encryptData(secretValue, prfResult);
        // Store the encrypted data
        return {
            status: true,
            data: {
                storageKey: JSON.stringify(encryptedData)
            }
        }
    } catch (error) {
        console.error('storeSecret error-->', error?.name, error);
        return {
            status: false,
            msg: error.message
        }
    }
}

// Retrieve and decrypt a stored secret using WebAuthn PRF
export const retrieveSecret = async (storageKey, credentialIdBase) => {
    const context = "secret data";
    const outputElement = document.getElementById('retrieveOutput');

    try {
        // Check if we have the encrypted data
        const storedData = storageKey


        // Get stored credential ID or use empty to try discoverable credentials
        let credentialId;
        const storedCredentialId = credentialIdBase;
        if (storedCredentialId) {
            credentialId = base64ToBuffer(storedCredentialId);
        }

        // Prepare context for PRF
        const contextBuffer = new TextEncoder().encode(context);

        const authOptions = {
            publicKey: {
                timeout: 60000,
                challenge: generateChallenge(),
                allowCredentials: credentialId ? [
                    {
                        id: credentialId,
                        type: 'public-key'
                    }
                ] : [],
                userVerification: "required",
                extensions: {
                    prf: {
                        eval: {
                            first: contextBuffer
                        }
                    }
                }
            }
        };

        const assertion = await navigator.credentials.get(authOptions);
        const extensionResults = assertion.getClientExtensionResults();

        // Ensure PRF result is available
        if (!extensionResults.prf || !extensionResults.prf.results || !extensionResults.prf.results.first) {
            return {
                status: false,
                msg: "PRF result not available"
            }
        }

        const prfResult = extensionResults.prf.results.first;

        // Parse the stored encrypted data
        const encryptedData = JSON.parse(storedData);

        // Decrypt the data using the PRF result
        const decryptedSecret = await decryptData(encryptedData, prfResult);

        return {
            status: true,
            data: {
                secret: decryptedSecret
            }
        }

    } catch (error) {
        console.error('retrieveSecret error-->', error?.name, error);
        return {
            status: false,
            msg: error.message
        }
    }
}
