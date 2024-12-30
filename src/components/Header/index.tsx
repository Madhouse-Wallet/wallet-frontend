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
import {
  CHAIN_NAMESPACES,
  IAdapter,
  IProvider,
  WEB3AUTH_NETWORK,
} from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import RPC from "../../lib/ethersRPC";

const clientId =
  "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  privateKeyProvider,
};
const web3auth = new Web3Auth(web3AuthOptions);

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [menu, setMenu] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<boolean>(false);
  const router = useRouter();
  const [login, setLogin] = useState<boolean>(false);
  const [checkLogin, setCheckLogin] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dispatch = useDispatch();
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [safeAddress, setSafeAddress] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const storedAddress = localStorage.getItem("wallet_address");
        // const storedProvider = localStorage.getItem("provider");
        if (storedAddress) {
          // setSafeAddress(storedAddress);
          // const providerData1 = JSON.parse(storedProvider);
          // const providerData = new ethers.providers.Web3Provider(providerData1);
          // const signer = await providerData.getSigner();
          // console.log("signer-->",signer)
          // console.log("providerData-->",providerData)
          // setLoggedIn(true); // User is already logged in
          // dispatch(loginSet({
          // login : true,
          // walletAddress : storedAddress,
          // provider : providerData,
          // signer : signer
          // }));
        }
        const adapters = await getDefaultExternalAdapters({
          options: web3AuthOptions,
        });
        adapters.forEach((adapter: IAdapter<unknown>) => {
          web3auth.configureAdapter(adapter);
        });
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          // If the user is connected but no address is in localStorage, fetch user details
          await fetchUserDetails();
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const loginTry = async () => {
    try {
      const web3authProvider = await web3auth.connect();
      console.log("web3authProvider-->", web3authProvider);
      setProvider(web3authProvider);
      // provider is
      const providerN = new ethers.providers.Web3Provider(web3authProvider);
      localStorage.setItem("provider", JSON.stringify(web3authProvider));

      if (web3auth.connected) {
        setLoggedIn(true);
        await fetchUserDetails();
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    await web3auth.logout();
    localStorage.removeItem("user_balance");
    localStorage.removeItem("user_info");
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("provider");
    setSafeAddress(null);
    setLoggedIn(false);
  };

  const fetchUserDetails = async () => {
    try {
      if (!provider) {
        console.error("Provider not initialized yet");
        return;
      }

      const address = await RPC.getAccounts(provider);
      const balance = await RPC.getBalance(provider);
      const userInfo = await web3auth.getUserInfo();
      console.log(address, balance, userInfo);
      const providerN = new ethers.providers.Web3Provider(provider);
      const signerT = await providerN.getSigner();
      dispatch(
        loginSet({
          login: true,
          walletAddress: address,
          provider: providerN,
          signer: signerT,
        })
      );
      localStorage.setItem("user_balance", balance);
      localStorage.setItem("wallet_address", address);
      localStorage.setItem("user_info", JSON.stringify(userInfo));

      setSafeAddress(address);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
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
              Madhouse Wallet
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
              className={`${
                !menu && "hidden"
              } lg:flex lg:items-center lg:justify-end w-full gap-2 flex-wrap menu`}
              id="navbarScroll"
            >
              <div className="flex items-center gap-2 ms-auto flex-wrap">
                <Tooltip
                  id="theme"
                  style={{ backgroundColor: "#76fc93", color: "#000" }}
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
