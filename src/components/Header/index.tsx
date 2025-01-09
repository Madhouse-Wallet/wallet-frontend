import React, { useState, useEffect, use } from "react";
import styled from "styled-components";
import Switch from "react-switch";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tooltip";
import { useTheme } from "../../ContextApi/ThemeContext";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import user from "@/Assets/Images/user.png";
import { createPortal } from "react-dom";
import LoginPop from "../Modals/LoginPop";
import { ethers } from "ethers";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";

import { writeFileSync } from "fs";
import {
  toKernelSmartAccount,
  ToKernelSmartAccountReturnType,
  toSafeSmartAccount,
} from "permissionless/accounts";
import { getAccountNonce } from "permissionless/actions";
import { Hex, createPublicClient, getContract, http, pad } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { sepolia, baseSepolia } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import {
  createBundlerClient,
  createWebAuthnCredential,
  entryPoint07Address,
  getUserOperationHash,
  toWebAuthnAccount,
} from "viem/account-abstraction";
import { createSmartAccountClient } from "permissionless";
import { erc7579Actions } from "permissionless/actions/erc7579";
import { clean } from "./utils";

import { getAddress, maxUint256, parseAbi } from "viem";
import { EntryPointVersion } from "viem/account-abstraction";

import { encodeFunctionData, parseAbiItem } from "viem";

import {
  create,
  get,
  PublicKeyCredentialWithAttestationJSON,
} from "@github/webauthn-json";
import crypto from "crypto";
import { PasskeyArgType, extractPasskeyData } from "@safe-global/protocol-kit";
import { saveRegistration } from "../../lib/state";

import {
  getWebAuthnValidator,
  getSmartSessionsValidator,
  getWebauthnValidatorSignature,
  getTrustAttestersAction,
  RHINESTONE_ATTESTER_ADDRESS,
  MOCK_ATTESTER_ADDRESS,
} from "@rhinestone/module-sdk";
import {
  b64ToBytes,
  findQuoteIndices,
  parseAndNormalizeSig,
  uint8ArrayToHexString,
} from "./utils";
import { parseEther } from "ethers/lib/utils";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [menu, setMenu] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<boolean>(false);
  const router = useRouter();
  const [login, setLogin] = useState<boolean>(false);
  const [checkLogin, setCheckLogin] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dispatch = useDispatch();
  const [provider, setProvider] = useState<null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [safeAddress, setSafeAddress] = useState<string | null>(null);
  const [createCredential, setCreateCredential] = useState<any | null>(null);

  function clean(str: string) {
    return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  // const loginTry = async () => {
  //   try {
  //     const usdc = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  //     const paymaster = "0x0000000000000039cd5e8ae05257ce51c473ddd1";

  //     const privateKey =
  //       (process.env.PRIVATE_KEY as Hex) ??
  //       (() => {
  //         const pk = generatePrivateKey();
  //         // writeFileSync(".env", `PRIVATE_KEY=${pk}`)
  //         return pk;
  //       })();

  //     const publicClient = createPublicClient({
  //       chain: baseSepolia,
  //       transport: http("https://sepolia.base.org"),
  //     });

  //     const apiKey = "pim_C2hN8VhSZsDJE3uAY4WFcU";
  //     const pimlicoUrl = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${apiKey}`;

  //     const pimlicoClient = createPimlicoClient({
  //       chain: baseSepolia,
  //       transport: http(pimlicoUrl),
  //       entryPoint: {
  //         address: entryPoint07Address,
  //         version: "0.7" as EntryPointVersion,
  //       },
  //     });

  //     console.log("line-104", privateKey);
  //     const account = await toSafeSmartAccount({
  //       client: publicClient,
  //       owners: [
  //         privateKeyToAccount(
  //           "0xa9ed77daae44bc5f5e5b8e9de8c7a28cd44b45823afb54b3d5f2fac49310b6df"
  //         ),
  //       ],
  //       version: "1.4.1",
  //       entryPoint: {
  //         address: entryPoint07Address,
  //         version: "0.7",
  //       },
  //       safe4337ModuleAddress: "0x7579EE8307284F293B1927136486880611F20002",
  //       erc7579LaunchpadAddress: "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
  //       attesters: [
  //         RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
  //         MOCK_ATTESTER_ADDRESS, // Mock Attester - do not use in production
  //       ],
  //       attestersThreshold: 1,
  //     });

  //     const smartAccountClient = createSmartAccountClient({
  //       account,
  //       chain: baseSepolia,
  //       bundlerTransport: http(pimlicoUrl),
  //       paymaster: pimlicoClient,
  //       userOperation: {
  //         estimateFeesPerGas: async () => {
  //           return (await pimlicoClient.getUserOperationGasPrice()).fast;
  //         },
  //       },
  //     }).extend(erc7579Actions());

  //     console.log("smartAccountClient-->", smartAccountClient);
  //     console.log(
  //       `Smart account address: https://sepolia.basescan.org/address/${account.address}`,
  //       account
  //     );
  //     setSafeAddress(account.address);
  //     setLoggedIn(true);
  //     dispatch(
  //       loginSet({
  //         login: true,
  //         walletAddress: account.address,
  //         provider: "providerN",
  //         signer: "signerT",
  //       })
  //     );

  //     //generate passkey
  //     const saltUUID = crypto.createHash("sha256").update("salt").digest("hex");

  //     // const _credential = await create({
  //     //   publicKey: {
  //     //     challenge: clean(crypto.randomBytes(32).toString("base64")),
  //     //     rp: {
  //     //       name: "Rhinestone",
  //     //       id: "localhost",
  //     //     },
  //     //     user: {
  //     //       id: saltUUID,
  //     //       name: "rhinestone wallet",
  //     //       displayName: "rhinestone wallet",
  //     //     },
  //     //     pubKeyCredParams: [{ alg: -7, type: "public-key" }],
  //     //     timeout: 60000,
  //     //     authenticatorSelection: {
  //     //       residentKey: "required",
  //     //       userVerification: "required",
  //     //       authenticatorAttachment: "platform",
  //     //     },
  //     //   },
  //     // });

  //     // console.log("_credential--->", _credential)

  //     // // Extract public key data using webauthn-json
  //     // const { attestationObject, clientDataJSON } = _credential.response;
  //     // // saveRegistration(_credential)
  //     // const passkey = await extractPasskeyData(_credential)
  //     // console.log("passkey--->",  passkey)

  //     const displayName = "Safe Owner"; // This can be customized to match, for example, a user name.
  //     // Generate a passkey credential using WebAuthn API
  //     // const passkeyCredential = await navigator.credentials.create({
  //     //   publicKey: {
  //     //     pubKeyCredParams: [
  //     //       {
  //     //         alg: -7,
  //     //         type: 'public-key'
  //     //       }
  //     //     ],
  //     //     challenge: window.crypto.getRandomValues(new Uint8Array(32)),
  //     //     rp: {
  //     //       name: "Rhinestone",
  //     //       id: "localhost",
  //     //     },
  //     //     user: {
  //     //       id: window.crypto.getRandomValues(new Uint8Array(32)),
  //     //       name: "rhinestone wallet",
  //     //       displayName: "rhinestone wallet",
  //     //     },
  //     //     timeout: 60_000,
  //     //     attestation: 'none',
  //     //     authenticatorSelection: {
  //     //       residentKey: "required",
  //     //       userVerification: "required",
  //     //       authenticatorAttachment: "platform",
  //     //     },
  //     //     extensions: {
  //     //       credProps: true,
  //     //     },
  //     //   }
  //     // })

  //     const passkeyCredential = {
  //       id: "rZKkbEPqYd8gJFgAE0_ENw",
  //       publicKey:
  //         "0xe6830f3a7f8e89c9563c913e12a6625e6bd53b3c00629b28417febf71ddb295591f723f25de36aa669005c48fd67753ee5df427461a978ba3511e748757d0965",
  //       raw: {
  //         authenticatorAttachment: "platform",
  //         clientExtensionResults: {},
  //         id: "rZKkbEPqYd8gJFgAE0_ENw",
  //         rawId: "rZKkbEPqYd8gJFgAE0_ENw",
  //         response: {
  //           attestationObject:
  //             "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViUSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAOqbjWZNAR0hPOS2tIy1ddQAEK2SpGxD6mHfICRYABNPxDelAQIDJiABIVgg5oMPOn-OiclWPJE-EqZiXmvVOzwAYpsoQX_r9x3bKVUiWCCR9yPyXeNqpmkAXEj9Z3U-5d9CdGGpeLo1EedIdX0JZQ",
  //           authenticatorData:
  //             "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAOqbjWZNAR0hPOS2tIy1ddQAEK2SpGxD6mHfICRYABNPxDelAQIDJiABIVgg5oMPOn-OiclWPJE-EqZiXmvVOzwAYpsoQX_r9x3bKVUiWCCR9yPyXeNqpmkAXEj9Z3U-5d9CdGGpeLo1EedIdX0JZQ",
  //           clientDataJSON:
  //             "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiYWF1MHRhRGVTOFlxS2lBZmpTVzY2USIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImNyb3NzT3JpZ2luIjpmYWxzZX0",
  //           publicKey:
  //             "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5oMPOn-OiclWPJE-EqZiXmvVOzwAYpsoQX_r9x3bKVWR9yPyXeNqpmkAXEj9Z3U-5d9CdGGpeLo1EedIdX0JZQ",
  //           publicKeyAlgorithm: -7,
  //           transports: ["hybrid", "internal"],
  //         },
  //         type: "public-key",
  //       },
  //     };

  //     console.log("passkeyCredential-->", passkeyCredential);

  //     try {
  //       toKernelSmartAccount({
  //         client: publicClient,
  //         version: "0.3.1",
  //         owners: [toWebAuthnAccount({ credential: passkeyCredential })],
  //         entryPoint: {
  //           address: entryPoint07Address,
  //           version: "0.7",
  //         },
  //       }).then(async (account: ToKernelSmartAccountReturnType<"0.7">) => {
  //         // setSmartAccountClient(
  //         const smartAccountClient = createSmartAccountClient({
  //           account,
  //           paymaster: pimlicoClient,
  //           chain: baseSepolia,
  //           userOperation: {
  //             estimateFeesPerGas: async () =>
  //               (await pimlicoClient.getUserOperationGasPrice()).fast,
  //           },
  //           bundlerTransport: http(pimlicoUrl),
  //         });
  //         // )
  //         console.log("acoun---->", account);
  //         try {
  //           const txHash = await smartAccountClient.sendTransaction({
  //             // calls: [
  //             //   {
  //             //     to: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
  //             //     abi: parseAbi([
  //             //       "function transfer(address to, uint256 value)",
  //             //     ]),
  //             //     functionName: "transfer",
  //             //     args: [
  //             //       "0x9A872029Ee44858EA17B79E30198947907a3a67A",
  //             //       BigInt(1000000000000000000),
  //             //     ],
  //             //   },
  //             // ],
  //             calls: [ 
  //               { 
  //                   to:"0x9A872029Ee44858EA17B79E30198947907a3a67A", 
  //                   value: BigInt(10000000000000) 
  //               } 
  //           ], 
  //             // paymasterContext: {
  //             //   token: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  //             // },
  //           });

  //           console.log("line-406", txHash);
  //         } catch (error) {
  //           console.log("liene-377", error);
  //         }
  //       });
  //     } catch (error) {
  //       console.log("liene-371", error);
  //     }
  //     console.log("line-298", "fu");
  //     if (!passkeyCredential) {
  //       throw Error("Passkey creation failed: No credential was returned.");
  //     }
  //     console.log(
  //       "passkeyCredential-->",
  //       passkeyCredential,
  //       passkeyCredential.id
  //     );
  //     const passkey = await extractPasskeyData(passkeyCredential.raw);
  //     console.log("Created Passkey:", passkey);
  //     let xr = passkey.coordinates.x;
  //     let yr = passkey.coordinates.y;
  //     let id = passkeyCredential.id;
  //     const webAuthnCredential = {
  //       pubKey: {
  //         x: xr,
  //         y: yr,
  //       },
  //       authenticatorId: id,
  //     };
  //     const smartSessions = getSmartSessionsValidator({});
  //     const webauthn = getWebAuthnValidator(webAuthnCredential);
  //     console.log(
  //       "module-->",
  //       webauthn,
  //       webauthn.type,
  //       webauthn.module,
  //       webauthn.initData
  //     );

  //     // const opHash = await smartAccountClient.installModule({
  //     //   type: webauthn.type,
  //     //   address: webauthn.module,
  //     //   context: webauthn.initData,
  //     // });

  //     // (await pimlicoClient.getUserOperationGasPrice()).fast
  //     // console.log("opHash-->", opHash);
  //     // await pimlicoClient.waitForUserOperationReceipt({
  //     //   hash: opHash,
  //     // });

  //     const nonce = await getAccountNonce(publicClient, {
  //       address: account.address,
  //       entryPointAddress: entryPoint07Address,
  //       key: BigInt(pad(webauthn.module, { dir: "right", size: 24 })),
  //     });

  //     console.log("line-260", nonce);
  //     const action = getTrustAttestersAction({
  //       threshold: 1,
  //       attesters: [RHINESTONE_ATTESTER_ADDRESS],
  //     });
  //     console.log("line-268", action);
  //     const calls = [
  //       {
  //         to: action.target,
  //         data: action.callData,
  //       },
  //     ];

  //     console.log("line-276", calls);
  //     //Batch Multiple Transactions: https://docs.pimlico.io/permissionless/how-to/parallel-transactions
  //     //
  //     const userOperation = await smartAccountClient.prepareUserOperation({
  //       account: account,
  //       calls: calls,
  //       nonce,
  //       // signature: getWebauthnValidatorMockSignature(),
  //       signature:
  //         "0x00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001635bc6d0f68ff895cae8a288ecf7542a6a9cd555df784b73e1e2ea7e9104b1db15e9015d280cb19527881c625fee43fd3a405d5b0d199a8c8e6589a7381209e40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97631d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f47b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a22746278584e465339585f3442797231634d77714b724947422d5f3330613051685a36793775634d30424f45222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a33303030222c2263726f73734f726967696e223a66616c73652c20226f746865725f6b6579735f63616e5f62655f61646465645f68657265223a22646f206e6f7420636f6d7061726520636c69656e74446174614a534f4e20616761696e737420612074656d706c6174652e205365652068747470733a2f2f676f6f2e676c2f796162506578227d000000000000000000000000",
  //     });

  //     console.log("line-288", userOperation);

  //     const userOpHashToSign = getUserOperationHash({
  //       chainId: baseSepolia.id,
  //       entryPointAddress: entryPoint07Address,
  //       entryPointVersion: "0.7",
  //       userOperation,
  //     });

  //     console.log("line-297", userOpHashToSign);

  //     // const formattedMessage = userOpHashToSign.startsWith("0x")
  //     //   ? userOpHashToSign.slice(2)
  //     //   : userOpHashToSign;

  //     // const challenge = base64FromUint8Array(
  //     //   hexStringToUint8Array(formattedMessage),
  //     //   true
  //     // );

  //     // // prepare assertion options
  //     // const assertionOptions: PublicKeyCredentialWithAttestationJSON = {
  //     //   challenge,
  //     //   // allowCredentials,
  //     //   userVerification: "required",
  //     // };
  //     //   const cred = await navigator.credentials.get({
  //     //     publicKey: {
  //     //         challenge: window.crypto.getRandomValues(new Uint8Array(32)),
  //     //         allowCredentials: [
  //     //             {
  //     //                 id: passkeyCredential.rawId, // Retrieve from backend
  //     //                 type: 'public-key',
  //     //                 // transports: ['usb', 'ble', 'nfc'],
  //     //             },
  //     //         ],
  //     //         timeout: 60_000,
  //     //     }
  //     // })
  //     // console.log("cred--->",cred)
  //     // const cred = await get({
  //     //   publicKey: {
  //     //     challenge: Buffer.from(userOpHashToSign, "hex").toString("base64"),
  //     //     timeout: 60000,
  //     //     userVerification: "required",
  //     //     rpId: "test",
  //     //     allowCredentials: [
  //     //       {
  //     //         id: passkeyCredential.rawId, // rawId
  //     //         type: "public-key",
  //     //       },
  //     //     ],
  //     //   },
  //     // });
  //     const credential = await get({
  //       publicKey: {
  //         challenge: clean(
  //           Buffer.from(userOpHashToSign.slice(2), "hex").toString("base64")
  //         ),
  //         timeout: 60000,
  //         userVerification: "required",
  //         rpId: "localhost",
  //         allowCredentials: [
  //           {
  //             id: passkeyCredential.id, // If the ID is already in the correct format
  //             type: "public-key",
  //           },
  //         ],
  //       },
  //     });
  //     console.log("line-329", credential);

  //     //   const credential = await createWebAuthnCredential({
  //     //     name: "Wallet"
  //     // })
  //     // console.log("credential",credential)
  //     //   if (!credential) return

  //     // return parseSignatureResponse({
  //     //   signatureB64: sigCredential.response.signature,
  //     //   rawAuthenticatorDataB64: sigCredential.response.authenticatorData,
  //     //   rawClientDataJSONB64: sigCredential.response.clientDataJSON,
  //     //   passkeyName: keyName,
  //     // });
  //     // get authenticator data
  //     // const { authenticatorData } = cred.response;
  //     // const authenticatorDataHex = uint8ArrayToHexString(
  //     //   b64ToBytes(authenticatorData),
  //     // );

  //     // // get client data JSON
  //     // const clientDataJSON = atob(cred.response.clientDataJSON);

  //     // // get challenge and response type location
  //     // const { beforeType } = findQuoteIndices(clientDataJSON);

  //     // // get signature r,s
  //     // const { signature } = cred.response;
  //     // const signatureHex = uint8ArrayToHexString(b64ToBytes(signature));
  //     // const { r, s } = parseAndNormalizeSig(signatureHex);

  //     // const userOpHash = await smartAccountClient.sendUserOperation({
  //     //   account: account,
  //     //   calls: calls,
  //     //   nonce,
  //     //   signature: getWebauthnValidatorSignature({
  //     //     authenticatorData: authenticatorDataHex,
  //     //     clientDataJSON,
  //     //     responseTypeLocation: BigInt(beforeType),
  //     //     r: BigInt(r),
  //     //     s: BigInt(s),
  //     //     usePrecompiled: false,
  //     //   }),
  //     // });
  //     // console.log("line-366",userOpHash)
  //     // const receipt = await pimlicoClient.waitForUserOperationReceipt({
  //     //   hash: userOpHash,
  //     // });
  //   } catch (error) {
  //     console.error("Login failed:", error);
  //   }
  // };


  // const loginTry = async () => {
  //   try {
  //     const usdc = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  //     const paymaster = "0x0000000000000039cd5e8ae05257ce51c473ddd1";

  //     const privateKey =
  //       (process.env.PRIVATE_KEY as Hex) ??
  //       (() => {
  //         const pk = generatePrivateKey();
  //         // writeFileSync(".env", `PRIVATE_KEY=${pk}`)
  //         return pk;
  //       })();

  //     const publicClient = createPublicClient({
  //       chain: baseSepolia,
  //       transport: http("https://sepolia.base.org"),
  //     });

  //     const apiKey = "pim_C2hN8VhSZsDJE3uAY4WFcU";
  //     const pimlicoUrl = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${apiKey}`;

  //     const pimlicoClient = createPimlicoClient({
  //       chain: baseSepolia,
  //       transport: http(pimlicoUrl),
  //       entryPoint: {
  //         address: entryPoint07Address,
  //         version: "0.7" as EntryPointVersion,
  //       },
  //     });

  //     console.log("line-104", privateKey);
  //     const account = await toSafeSmartAccount({
  //       client: publicClient,
  //       owners: [
  //         privateKeyToAccount(
  //           privateKey
  //         ),
  //       ],
  //       version: "1.4.1",
  //       entryPoint: {
  //         address: entryPoint07Address,
  //         version: "0.7",
  //       },
  //       safe4337ModuleAddress: "0x7579EE8307284F293B1927136486880611F20002",
  //       erc7579LaunchpadAddress: "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
  //       attesters: [
  //         RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
  //         MOCK_ATTESTER_ADDRESS, // Mock Attester - do not use in production
  //       ],
  //       attestersThreshold: 1,
  //     });

  //     const smartAccountClient = createSmartAccountClient({
  //       account,
  //       chain: baseSepolia,
  //       bundlerTransport: http(pimlicoUrl),
  //       paymaster: pimlicoClient,
  //       userOperation: {
  //         estimateFeesPerGas: async () => {
  //           return (await pimlicoClient.getUserOperationGasPrice()).fast;
  //         },
  //       },
  //     }).extend(erc7579Actions());

  //     console.log("smartAccountClient-->", smartAccountClient);
  //     console.log(
  //       `Smart account address: https://sepolia.basescan.org/address/${account.address}`,
  //       account
  //     );
  //     setSafeAddress(account.address);
  //     setLoggedIn(true);
  //     dispatch(
  //       loginSet({
  //         login: true,
  //         walletAddress: account.address,
  //         provider: "providerN",
  //         signer: "signerT",
  //       })
  //     );


  //     // const passkeyCredential = {
  //     //   id: "rZKkbEPqYd8gJFgAE0_ENw",
  //     //   publicKey:
  //     //     "0xe6830f3a7f8e89c9563c913e12a6625e6bd53b3c00629b28417febf71ddb295591f723f25de36aa669005c48fd67753ee5df427461a978ba3511e748757d0965",
  //     //   raw: {
  //     //     authenticatorAttachment: "platform",
  //     //     clientExtensionResults: {},
  //     //     id: "rZKkbEPqYd8gJFgAE0_ENw",
  //     //     rawId: "rZKkbEPqYd8gJFgAE0_ENw",
  //     //     response: {
  //     //       attestationObject:
  //     //         "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViUSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAOqbjWZNAR0hPOS2tIy1ddQAEK2SpGxD6mHfICRYABNPxDelAQIDJiABIVgg5oMPOn-OiclWPJE-EqZiXmvVOzwAYpsoQX_r9x3bKVUiWCCR9yPyXeNqpmkAXEj9Z3U-5d9CdGGpeLo1EedIdX0JZQ",
  //     //       authenticatorData:
  //     //         "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAOqbjWZNAR0hPOS2tIy1ddQAEK2SpGxD6mHfICRYABNPxDelAQIDJiABIVgg5oMPOn-OiclWPJE-EqZiXmvVOzwAYpsoQX_r9x3bKVUiWCCR9yPyXeNqpmkAXEj9Z3U-5d9CdGGpeLo1EedIdX0JZQ",
  //     //       clientDataJSON:
  //     //         "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiYWF1MHRhRGVTOFlxS2lBZmpTVzY2USIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImNyb3NzT3JpZ2luIjpmYWxzZX0",
  //     //       publicKey:
  //     //         "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5oMPOn-OiclWPJE-EqZiXmvVOzwAYpsoQX_r9x3bKVWR9yPyXeNqpmkAXEj9Z3U-5d9CdGGpeLo1EedIdX0JZQ",
  //     //       publicKeyAlgorithm: -7,
  //     //       transports: ["hybrid", "internal"],
  //     //     },
  //     //     type: "public-key",
  //     //   },
  //     // };

      

  //       const passkeyCredential = await createWebAuthnCredential({
  //         name: "Wallet"
  //     })

  //     console.log("passkeyCredential-->", passkeyCredential);
  //     console.log("line-298", "fu");
  //     if (!passkeyCredential) {
  //       throw Error("Passkey creation failed: No credential was returned.");
  //     }
  //     console.log(
  //       "passkeyCredential-->",
  //       passkeyCredential,
  //       passkeyCredential.id
  //     );
  //     const passkey = await extractPasskeyData(passkeyCredential.raw);
  //     console.log("Created Passkey:", passkey);
  //     let xr = passkey.coordinates.x;
  //     let yr = passkey.coordinates.y;
  //     let id = passkeyCredential.id;
  //     const webAuthnCredential = {
  //       pubKey: {
  //         x: xr,
  //         y: yr,
  //       },
  //       authenticatorId: id,
  //     };
  //     const smartSessions = getSmartSessionsValidator({});
  //     const webauthn = getWebAuthnValidator(webAuthnCredential);
  //     console.log(
  //       "module-->",
  //       webauthn,
  //       webauthn.type,
  //       webauthn.module,
  //       webauthn.initData
  //     );

  //     const opHash = await smartAccountClient.installModule({
  //       type: webauthn.type,
  //       address: webauthn.module,
  //       context: webauthn.initData,
  //     });

  //     (await pimlicoClient.getUserOperationGasPrice()).fast
  //     console.log("opHash-->", opHash);
  //     await pimlicoClient.waitForUserOperationReceipt({
  //       hash: opHash,
  //     });

  //     try {
  //       toKernelSmartAccount({
  //         client: publicClient,
  //         version: "0.3.1",
  //         owners: [toWebAuthnAccount({ credential: passkeyCredential })],
  //         entryPoint: {
  //           address: entryPoint07Address,
  //           version: "0.7",
  //         },
  //       }).then(async (account: ToKernelSmartAccountReturnType<"0.7">) => {
  //         // setSmartAccountClient(
  //         const smartAccountClient = createSmartAccountClient({
  //           account,
  //           paymaster: pimlicoClient,
  //           chain: baseSepolia,
  //           userOperation: {
  //             estimateFeesPerGas: async () =>
  //               (await pimlicoClient.getUserOperationGasPrice()).fast,
  //           },
  //           bundlerTransport: http(pimlicoUrl),
  //         });
  //         // )
  //         console.log("acoun---->", account);
  //         try {
  //           const txHash = await smartAccountClient.sendTransaction({
  //             // calls: [
  //             //   {
  //             //     to: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
  //             //     abi: parseAbi([
  //             //       "function transfer(address to, uint256 value)",
  //             //     ]),
  //             //     functionName: "transfer",
  //             //     args: [
  //             //       "0x9A872029Ee44858EA17B79E30198947907a3a67A",
  //             //       BigInt(1000000000000000000),
  //             //     ],
  //             //   },
  //             // ],
  //             calls: [ 
  //               { 
  //                   to:"0x9A872029Ee44858EA17B79E30198947907a3a67A", 
  //                   value: BigInt(10000000000000) 
  //               } 
  //           ], 
  //             // paymasterContext: {
  //             //   token: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  //             // },
  //           });

  //           console.log("line-406", txHash);
  //         } catch (error) {
  //           console.log("liene-377", error);
  //         }
  //       });
  //     } catch (error) {
  //       console.log("liene-371", error);
  //     }

  //   } catch (error) {
  //     console.error("Login failed:", error);
  //   }
  // };
  


  const loginTry = async () => {
    try {
      const usdc = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
      const paymaster = "0x0000000000000039cd5e8ae05257ce51c473ddd1";

      const privateKey =
        (process.env.PRIVATE_KEY as Hex) ??
        (() => {
          const pk = generatePrivateKey();
          // writeFileSync(".env", `PRIVATE_KEY=${pk}`)
          return pk;
        })();

      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http("https://sepolia.base.org"),
      });

      const apiKey = "pim_C2hN8VhSZsDJE3uAY4WFcU";
      const pimlicoUrl = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${apiKey}`;

      const pimlicoClient = createPimlicoClient({
        chain: baseSepolia,
        transport: http(pimlicoUrl),
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7" as EntryPointVersion,
        },
      });

      console.log("line-104", privateKey);
      const account = await toSafeSmartAccount({
        client: publicClient,
        owners: [
          privateKeyToAccount(
            '0xa9ed77daae44bc5f5e5b8e9de8c7a28cd44b45823afb54b3d5f2fac49310b6df'
          ),
        ],
        version: "1.4.1",
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
        safe4337ModuleAddress: "0x7579EE8307284F293B1927136486880611F20002",
        erc7579LaunchpadAddress: "0x7579011aB74c46090561ea277Ba79D510c6C00ff",
        attesters: [
          RHINESTONE_ATTESTER_ADDRESS, // Rhinestone Attester
          MOCK_ATTESTER_ADDRESS, // Mock Attester - do not use in production
        ],
        attestersThreshold: 1,
      });

      const smartAccountClient = createSmartAccountClient({
        account,
        chain: baseSepolia,
        bundlerTransport: http(pimlicoUrl),
        paymaster: pimlicoClient,
        userOperation: {
          estimateFeesPerGas: async () => {
            return (await pimlicoClient.getUserOperationGasPrice()).fast;
          },
        },
      }).extend(erc7579Actions());

      console.log("smartAccountClient-->", smartAccountClient);
      console.log(
        `Smart account address: https://sepolia.basescan.org/address/${account.address}`,
        account
      );
      setSafeAddress(account.address);
      setLoggedIn(true);
      dispatch(
        loginSet({
          login: true,
          walletAddress: account.address,
          provider: "providerN",
          signer: "signerT",
        })
      );


      const passkeyCredential = {
        id: "rZKkbEPqYd8gJFgAE0_ENw",
        publicKey:
          "0xe6830f3a7f8e89c9563c913e12a6625e6bd53b3c00629b28417febf71ddb295591f723f25de36aa669005c48fd67753ee5df427461a978ba3511e748757d0965",
        raw: {
          authenticatorAttachment: "platform",
          clientExtensionResults: {},
          id: "rZKkbEPqYd8gJFgAE0_ENw",
          rawId: "rZKkbEPqYd8gJFgAE0_ENw",
          response: {
            attestationObject:
              "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViUSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAOqbjWZNAR0hPOS2tIy1ddQAEK2SpGxD6mHfICRYABNPxDelAQIDJiABIVgg5oMPOn-OiclWPJE-EqZiXmvVOzwAYpsoQX_r9x3bKVUiWCCR9yPyXeNqpmkAXEj9Z3U-5d9CdGGpeLo1EedIdX0JZQ",
            authenticatorData:
              "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NdAAAAAOqbjWZNAR0hPOS2tIy1ddQAEK2SpGxD6mHfICRYABNPxDelAQIDJiABIVgg5oMPOn-OiclWPJE-EqZiXmvVOzwAYpsoQX_r9x3bKVUiWCCR9yPyXeNqpmkAXEj9Z3U-5d9CdGGpeLo1EedIdX0JZQ",
            clientDataJSON:
              "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiYWF1MHRhRGVTOFlxS2lBZmpTVzY2USIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImNyb3NzT3JpZ2luIjpmYWxzZX0",
            publicKey:
              "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5oMPOn-OiclWPJE-EqZiXmvVOzwAYpsoQX_r9x3bKVWR9yPyXeNqpmkAXEj9Z3U-5d9CdGGpeLo1EedIdX0JZQ",
            publicKeyAlgorithm: -7,
            transports: ["hybrid", "internal"],
          },
          type: "public-key",
        },
      };

      

      //   const passkeyCredential = await createWebAuthnCredential({
      //     name: "Wallet"
      // })

      console.log("passkeyCredential-->", passkeyCredential);
      console.log("line-298", "fu");
      if (!passkeyCredential) {
        throw Error("Passkey creation failed: No credential was returned.");
      }
      console.log(
        "passkeyCredential-->",
        passkeyCredential,
        passkeyCredential.id
      );
      // const passkey = await extractPasskeyData(passkeyCredential.raw);
      // console.log("Created Passkey:", passkey);
      // let xr = passkey.coordinates.x;
      // let yr = passkey.coordinates.y;
      // let id = passkeyCredential.id;
      // const webAuthnCredential = {
      //   pubKey: {
      //     x: xr,
      //     y: yr,
      //   },
      //   authenticatorId: id,
      // };
      // const smartSessions = getSmartSessionsValidator({});
      // const webauthn = getWebAuthnValidator(webAuthnCredential);
      // console.log(
      //   "module-->",
      //   webauthn,
      //   webauthn.type,
      //   webauthn.module,
      //   webauthn.initData
      // );

      // const opHash = await smartAccountClient.installModule({
      //   type: webauthn.type,
      //   address: webauthn.module,
      //   context: webauthn.initData,
      // });

      // (await pimlicoClient.getUserOperationGasPrice()).fast
      // console.log("opHash-->", opHash);
      // await pimlicoClient.waitForUserOperationReceipt({
      //   hash: opHash,
      // });

      try {
        toKernelSmartAccount({
          client: publicClient,
          version: "0.3.1",
          owners: [toWebAuthnAccount({ credential: passkeyCredential })],
          entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
          },
        }).then(async (account: ToKernelSmartAccountReturnType<"0.7">) => {
          // setSmartAccountClient(
          const smartAccountClient = createSmartAccountClient({
            account,
            paymaster: pimlicoClient,
            chain: baseSepolia,
            userOperation: {
              estimateFeesPerGas: async () =>
                (await pimlicoClient.getUserOperationGasPrice()).fast,
            },
            bundlerTransport: http(pimlicoUrl),
          });
          // )
          console.log("acoun---->", account);
          try {
            const txHash = await smartAccountClient.sendTransaction({
              // calls: [
              //   {
              //     to: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
              //     abi: parseAbi([
              //       "function transfer(address to, uint256 value)",
              //     ]),
              //     functionName: "transfer",
              //     args: [
              //       "0x9A872029Ee44858EA17B79E30198947907a3a67A",
              //       BigInt(1000000000000000000),
              //     ],
              //   },
              // ],
              calls: [ 
                { 
                    to:"0x9A872029Ee44858EA17B79E30198947907a3a67A", 
                    value: BigInt(10000000000000) 
                } 
            ], 
              // paymasterContext: {
              //   token: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
              // },
            });

            console.log("line-406", txHash);
          } catch (error) {
            console.log("liene-377", error);
          }
        });
      } catch (error) {
        console.log("liene-371", error);
      }

    } catch (error) {
      console.error("Login failed:", error);
    }
  };


  const logout = async () => {
    localStorage.removeItem("user_balance");
    localStorage.removeItem("user_info");
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("provider");
    setSafeAddress(null);
    setLoggedIn(false);
  };

  const splitAddress = (address: string, charDisplayed: number = 6): string => {
    const firstPart = address.slice(0, charDisplayed);
    const lastPart = address.slice(-charDisplayed);
    return `${firstPart}...${lastPart}`;
  };

  const handleDropdownClick = (index: number, isOpen: boolean) => {
    setOpenDropdown(isOpen ? index : null);
  };

  const isChecked = theme === "light";

  return (
    <>
      {login &&
        createPortal(
          <LoginPop login={login} setLogin={setLogin} />,
          document.body
        )}
      <header className="siteHeader sticky top-0 py-2 w-full shadow z-[999] bg-[var(--backgroundColor)]">
        <div className="container mx-auto">
          <Nav className="flex items-center justify-between ">
            <a
              href="#"
              className="text-[var(--textColor)] font-bold text-lg whitespace-nowrap"
            >
              {logo}
            </a>
            <div className="lg:hidden">
              <button
                onClick={() => setMenu(!menu)}
                aria-controls="navbarScroll"
                className="border-0 p-0"
              >
                <span className="block w-6 h-0.5 bg-[var(--textColor)] mb-1"></span>
                <span className="block w-6 h-0.5 bg-[var(--textColor)] mb-1"></span>
                <span className="block w-6 h-0.5 bg-[var(--textColor)]"></span>
              </button>
            </div>
            <div
              className={`${!menu && "hidden"
                } lg:flex lg:items-center lg:justify-end w-full gap-2 flex-wrap menu`}
              id="navbarScroll"
            >
              <div className="flex items-center gap-2 ms-auto flex-wrap">
                <Tooltip
                  id="theme"
                  style={{ backgroundColor: "#000", color: "#fff" }}
                />
                <div
                  data-tooltip-id="theme"
                  data-tooltip-content={
                    !isChecked ? "Dark Theme" : "Light Theme"
                  }
                >
                  <GradientHandleSwitch
                    uncheckedIcon={undefined}
                    checkedIcon={undefined}
                    height={16}
                    width={48}
                    handleDiameter={24}
                    offColor="#4C4C57"
                    onColor="#4C4C57"
                    checked={isChecked}
                    onChange={toggleTheme}
                    boxShadow="0px 0px 0px 0px"
                    activeBoxShadow="0px 0px 0px 0px"
                  />
                </div>
                {loggedIn ? (
                  <>
                    <button className="btn flex items-center justify-center commonBtn font-normal rounded">
                      Safe Address:{" "}
                      {safeAddress ? splitAddress(safeAddress) : "Loading..."}
                    </button>
                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn p-0 border-0 bg-transparent"
                      >
                        <Image
                          src={user}
                          alt="User Avatar"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-white rounded-box z-[1] w-52 p-2 shadow"
                      >
                        <li>
                          <Link
                            href="/setting"
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                          >
                            Setting
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={logout}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={loginTry}
                    className="btn flex items-center justify-center commonBtn"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </Nav>
        </div>
      </header>
    </>
  );
};

const GradientHandleSwitch = styled(Switch)`
  .react-switch-handle {
    background-image: linear-gradient(90deg, #ffdf56, #ff8735 50%) !important;
  }
`;

const Nav = styled.nav`
  @media (max-width: 1024px) {
    flex-wrap: wrap;
    .menu {
      padding-top: 20px;
    }
  }
`;

export default Header;

const logo = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="70"
    height="70"
    viewBox="0 0 100 70"
    fill="none"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M21 20H29V30L21 30V20ZM21 38H10V30H21V38ZM29 38V49H21V38L29 38ZM29 38H40V30H29V38Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M71.2143 54.4276H66.3571V60.4857H60.2857V54.4276H58.7011V54.4143H53V48.3429H58.7011V21.1429H53V15.0714H60.2857V9H66.3571V15.0714H71.2143V9H77.2857V15.0714H75.8286C83.2211 15.0714 87.8573 18.8624 87.8573 24.8901C87.8573 29.1996 84.6394 32.8 80.4659 33.4266V33.6451C85.8112 34.0544 89.7394 37.9546 89.7394 43.1639C89.7394 49.8668 84.8616 54.1447 76.9336 54.4143H77.2857V60.4857H71.2143V54.4276ZM66.9388 21.2084V31.4364H72.8572C77.2481 31.4364 79.7568 29.4996 79.7568 26.1724C79.7568 23.008 77.5468 21.2084 73.7024 21.2084H66.9388ZM66.9388 48.2906H74.0302C78.7756 48.2906 81.339 46.2725 81.339 42.5094C81.339 38.8265 78.6931 36.863 73.8384 36.863H66.94L66.9388 48.2906Z"
      fill="currentColor"
    />
  </svg>
);
