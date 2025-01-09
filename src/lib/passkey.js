
import {
    createWebAuthnCredential,
} from "viem/account-abstraction";
export async function create(username) {
    try {
        // let crdId = window.crypto.getRandomValues(new Uint8Array(32));
        // console.log("crdId=--->", crdId)
        // const passkeyCredential = await navigator.credentials.create({
        //     publicKey: {
        //         pubKeyCredParams: [
        //             {
        //                 alg: -7,
        //                 type: 'public-key'
        //             }
        //         ],
        //         challenge: window.crypto.getRandomValues(new Uint8Array(32)),
        //         rp: {
        //             name: "Rhinestone",
        //             // id: "c3wnzc6x-3000.inc1.devtunnels.ms",
        //         },
        //         user: {
        //             id: crdId,
        //             name: username,
        //             displayName: username,
        //         },
        //         timeout: 60_000,
        //         attestation: 'none',
        //         authenticatorSelection: {
        //             residentKey: "required",
        //             userVerification: "required",
        //             authenticatorAttachment: "platform",
        //         },
        //         extensions: {
        //             credProps: true,
        //         },
        //     }
        // })
        const passkeyCredential = await createWebAuthnCredential({
            name: username
        })
        return passkeyCredential
    } catch (error) {
        console.log("error---->", error)
        return false
    }
}




export async function get(credentialId) {
    try {
        const passkeyCredential = await navigator.credentials.get({
            publicKey: {
                challenge: window.crypto.getRandomValues(new Uint8Array(32)),
                allowCredentials: [
                    {
                        id: credentialId, // Retrieve from backend
                        type: 'public-key',
                        // transports: ['usb', 'ble', 'nfc'],
                    },
                ],
                timeout: 60_000,
            }
        })
        return passkeyCredential
    } catch (error) {
        console.log("error---->", error)
        return false
    }
}