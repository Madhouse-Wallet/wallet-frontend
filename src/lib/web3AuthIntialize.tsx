import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS, WEB3AUTH_NETWORK } from "@web3auth/base";
import { AuthAdapter } from "@web3auth/auth-adapter";
// import "./App.css";
//import RPC from "./web3RPC"; // for using web3.js
//import RPC from "./ethersRPC"; // for using ethers.js
import RPC from "../components/web3Auth/viemRPC"; // for using viem

// Plugins
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";

const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // get from https://dashboard.web3auth.io
// tBTC SDK Initialization Function
export async function initializeWeb3Auth() {
  try {
    const chainConfig = {
      // chainId: "0x1", // Please use 0x1 for Mainnet
      // rpcTarget: "https://rpc.ankr.com/eth",
      // chainNamespace: CHAIN_NAMESPACES.EIP155,
      // displayName: "Ethereum Mainnet",
      // blockExplorerUrl: "https://etherscan.io/",
      // ticker: "ETH",
      // tickerName: "Ethereum",
      // logo: "https://images.toruswallet.io/eth.svg",
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0xaa36a7", // hex for 11155111
      displayName: "Ethereum Sepolia",
      tickerName: "Ethereum",
      ticker: "ETH",
      decimals: 18,
      rpcTarget: "https://rpc.ankr.com/eth_sepolia",
      blockExplorerUrl: "https://sepolia.etherscan.io",
      logo: "https://images.toruswallet.io/eth.svg",
    };

    const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig: chainConfig } });

    const web3auth = new Web3Auth({
      clientId,
      // uiConfig refers to the whitelabeling options, which is available only on Growth Plan and above
      // Please remove this parameter if you're on the Base Plan
      uiConfig: {
        appName: "W3A Heroes",
        mode: "light",
        // loginMethodsOrder: ["apple", "google", "twitter"],
        logoLight: "https://web3auth.io/images/web3authlog.png",
        logoDark: "https://web3auth.io/images/web3authlogodark.png",
        defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
        loginGridCol: 3,
        primaryButton: "externalLogin", // "externalLogin" | "socialLogin" | "emailLogin"
        loginMethodsOrder: ["google", "github", "twitter", "farcaster", "discord", "twitch", "facebook",],
      },
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
      privateKeyProvider: privateKeyProvider,
    });

    const authAdapter = new AuthAdapter({
      loginSettings: {
        mfaLevel: "optional",
      },
      adapterSettings: {
        whiteLabel: {
          appName: "W3A Heroes",
          logoLight: "https://web3auth.io/images/web3authlog.png",
          logoDark: "https://web3auth.io/images/web3authlogodark.png",
          defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
          mode: "dark", // whether to enable dark mode. defaultValue: false
        },
        mfaSettings: {
          deviceShareFactor: {
            enable: true,
            priority: 1,
            mandatory: true,
          },
          backUpShareFactor: {
            enable: true,
            priority: 2,
            mandatory: true,
          },
          socialBackupFactor: {
            enable: true,
            priority: 3,
            mandatory: true,
          },
          passwordFactor: {
            enable: true,
            priority: 4,
            mandatory: true,
          },
        },
        loginConfig: {
          facebook: {
            verifier: "w3a-facebook-demo",
            typeOfLogin: "facebook",
            clientId: "215892741216994", //use your app client id you got from facebook
          },
          discord: {
            verifier: "w3a-discord-demo",
            typeOfLogin: "discord",
            clientId: "1151006428610433095", //use your app client id you got from discord
          },
          twitch: {
            verifier: "w3a-twitch-demo",
            typeOfLogin: "twitch",
            clientId: "3k7e70gowvxjaxg71hjnc8h8ih3bpf", //use your app client id you got from twitch
          },
          twitter: {
            verifier: "w3a-auth0-demo",
            typeOfLogin: "twitter",
            clientId: "hUVVf4SEsZT7syOiL0gLU9hFEtm2gQ6O", //use your app client id from Auth0, since twitter login is not supported directly
            jwtParameters: {
              domain: "https://web3auth.au.auth0.com",
              verifierIdField: "sub",
              isVerifierIdCaseSensitive: true,
            }
          },
          google: {
            verifier: "aggregate-sapphire",
            verifierSubIdentifier: "w3a-google",
            typeOfLogin: "google",
            clientId: "519228911939-cri01h55lsjbsia1k7ll6qpalrus75ps.apps.googleusercontent.com",
          },
          github: {
            verifier: "aggregate-sapphire",
            verifierSubIdentifier: "w3a-a0-github",
            typeOfLogin: "github",
            clientId: "hiLqaop0amgzCC0AXo4w0rrG9abuJTdu",
            jwtParameters: {
              domain: "https://web3auth.au.auth0.com",
              verifierIdField: "email",
              isVerifierIdCaseSensitive: false,
              connection: "github",
            }
          },
        },
      },
    });
    web3auth.configureAdapter(authAdapter);

    // plugins and adapters are optional and can be added as per your requirement
    // read more about plugins here: https://web3auth.io/docs/sdk/web/plugins/

    // adding torus wallet connector plugin

    // Wallet Services Plugin
    const walletServicesPlugin = new WalletServicesPlugin({
      wsEmbedOpts: {},
      walletInitOptions: { whiteLabel: { showWidgetButton: true } },
    });

    web3auth.addPlugin(walletServicesPlugin);

    // await web3auth.initModal();
    await web3auth.initModal({
      modalConfig: {
        [WALLET_ADAPTERS.AUTH]: {
          label: "Auth Adapter",
          loginMethods: {
            // Disable the following login methods
            apple: {
              name: "apple",
              showOnModal: false,
            },
            reddit: {
              name: "reddit",
              showOnModal: false,
            },
            line: {
              name: "line",
              showOnModal: false,
            },
            wechat: {
              name: "wechat",
              showOnModal: false,
            },
            kakao: {
              name: "kakao",
              showOnModal: false,
            },
            linkedin: {
              name: "linkedin",
              showOnModal: false,
            },
            weibo: {
              name: "weibo",
              showOnModal: false,
            },
            // Disable email_passwordless and sms_passwordless
            email_passwordless: {
              name: "email_passwordless",
              showOnModal: false,
            },
            sms_passwordless: {
              name: "sms_passwordless",
              showOnModal: false,
            },
          },
        },
      },
    });

    if (web3auth.connected) {
      const user = await web3auth.getUserInfo();
      return web3auth
    } else {
      return false
    }
  } catch (error) {
    console.error(error);
    return false
  }
}
