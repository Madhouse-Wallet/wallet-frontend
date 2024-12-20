import React, { useEffect, useState } from "react";
import { Button, Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import Switch from "react-switch";
import user from "@/public/user.png";
import { useTheme } from "@/components/ContextApi/ThemeContext";
import styled from "styled-components";
import { Tooltip } from "react-tooltip";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginPop from "@/components/Modals/LoginPop";
import { STORAGE_ADDRESS } from "@/lib/constants";

import { CHAIN_NAMESPACES, IAdapter, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { getDefaultExternalAdapters } from "@web3auth/default-evm-adapter";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import RPC from "../../lib/ethersRPC";
import { userDetails } from "@/lib/redux/slices/auth";
import { useDispatch,useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../lib/redux/store";
import { setSafeAddress } from "@/lib/redux/slices/auth/authSlice";

const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ";

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
  const { userInfo, safeAddress, userBalance } = useSelector((state: RootState) => state.auth);
  console.log("line-55",userInfo, safeAddress, userBalance )
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  // const [safeAddress, setSafeAddress] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const isChecked: boolean = theme === "light";
  const dispatch = useDispatch<AppDispatch>();
  

  useEffect(() => {
    const init = async () => {
      try {
        const storedAddress = localStorage.getItem(STORAGE_ADDRESS);
        if (storedAddress) {
          setSafeAddress(storedAddress);
          setLoggedIn(true); // User is already logged in
        }

        const adapters = await getDefaultExternalAdapters({ options: web3AuthOptions });
        adapters.forEach((adapter: IAdapter<unknown>) => {
          web3auth.configureAdapter(adapter);
        });
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected && !storedAddress) {
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
      setProvider(web3authProvider);
      if (web3auth.connected) {
        setLoggedIn(true);
        await fetchUserDetails(); // Fetch and display user details on login
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    await web3auth.logout();
    localStorage.removeItem(STORAGE_ADDRESS);
    localStorage.removeItem("user_balance");
    localStorage.removeItem("user_info");
    setSafeAddress('');
    setLoggedIn(false);
  };

  // const fetchUserDetails = async () => {
  //   try {
  //     if (!provider) {
  //       console.error("Provider not initialized yet");
  //       return;
  //     }

  //     // Fetch account details
  //     const address = await RPC.getAccounts(provider);
  //     const balance = await RPC.getBalance(provider);
  //     const userInfo = await web3auth.getUserInfo();

  //     // Save details to local storage
  //     localStorage.setItem(STORAGE_ADDRESS, address);
  //     localStorage.setItem("user_balance", balance);
  //     localStorage.setItem("user_info", JSON.stringify(userInfo));

  //     // Update the safe address display
  //     setSafeAddress(address);
  //   } catch (error) {
  //     console.error("Failed to fetch user details:", error);
  //   }
  // };

  const fetchUserDetails = () => {
    dispatch(userDetails(provider, RPC, web3auth));
  };

  const splitAddress = (address: string, charDisplayed: number = 6): string => {
    const firstPart = address.slice(0, charDisplayed);
    const lastPart = address.slice(-charDisplayed);
    return `${firstPart}...${lastPart}`;
  };

  return (
    <>
      <header
        className="siteHeader sticky-top py-1 w-100 shadow"
        style={{ zIndex: 99, background: "var(--backgroundColor)" }}
      >
        <Container>
          <Navbar expand="lg">
            <Navbar.Brand
              className="fw-bold"
              href="#"
              style={{ fontSize: 20, color: "var(--textColor)" }}
            >
              Madhouse Wallet
            </Navbar.Brand>

            <Navbar.Toggle
              className="border-0 p-0"
              aria-controls="navbarScroll"
            />
            <Navbar.Collapse
              className="justify-content-end w-100"
              id="navbarScroll"
            >
              <Nav className="my-2 my-lg-0 align-items-center justify-content-end w-100 gap-10 flex-wrap">
                <div className="right d-flex align-items-center gap-10 flex-wrap">
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
                  {!loggedIn ? (
                    <Button
                      onClick={loginTry}
                      className="d-flex align-items-center justify-content-center commonBtn"
                    >
                      Login
                    </Button>
                  ) : (
                    <>
                      <Button className="d-flex align-items-center justify-content-center commonBtn">
                        {safeAddress ? splitAddress(safeAddress) : "Loading..."}
                      </Button>
                      <Dropdown>
                        <Dropdown.Toggle
                          className="p-0 border-0 d-flex align-items-center"
                          variant="transparent"
                          id="dropdown-basic"
                        >
                          <Image
                            src={user}
                            alt=""
                            style={{ height: 40, width: 40 }}
                            className="img-fluid object-fit-cover rounded-circle"
                          />
                        </Dropdown.Toggle>

                        <Dropdown.Menu style={{ right: 0, left: "unset" }}>
                          <LinkList className="list-unstyled ps-0 mb-0">
                            <li>
                              <Link
                                href="/setting"
                                className="px-3 py-1 d-flex align-items-center gap-10 text-dark fw-sbold"
                              >
                                Setting
                              </Link>
                            </li>
                            <li>
                              <div
                                onClick={logout}
                                className="px-3 py-1 d-flex align-items-center gap-10 text-dark fw-sbold"
                              >
                                Logout
                              </div>
                            </li>
                          </LinkList>
                        </Dropdown.Menu>
                      </Dropdown>
                    </>
                  )}
                </div>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Container>
      </header>
    </>
  );
};

const GradientHandleSwitch = styled(Switch)`
  .react-switch-handle {
    background: linear-gradient(180deg, #76fc93 0%, #1f854f 100%) !important;
  }
`;

const LinkList = styled.ul`
  font-size: 12px;
`;

export default Header;
