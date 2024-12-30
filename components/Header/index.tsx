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
import { userDetails } from "@/lib/redux/slices/auth";
import { Provider, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, store } from "../../lib/redux/store";
import { setSafeAddress } from "@/lib/redux/slices/auth/authSlice";
import { 
  initWeb3Auth, 
  connectWeb3Auth,
  disconnectWeb3Auth,
  getUserInfo,
  STORAGE_KEYS,
  transferERC20WithGasToken,
} from "@/lib/web3auth";

const Header: React.FC = () => {
  const { userInfo, safeAddress, userBalance } = useSelector(
    (state: RootState) => state.auth
  );
  console.log("line-55", userInfo, safeAddress, userBalance);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  // const [safeAddress, setSafeAddress] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const isChecked: boolean = theme === "light";
  const dispatch = useDispatch<AppDispatch>();
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const storedAddress = localStorage.getItem(STORAGE_KEYS.ADDRESS);
        if (storedAddress) {
          dispatch(setSafeAddress(storedAddress));
          setLoggedIn(true);
        }
  
        const web3authInstance = await initWeb3Auth();
        setWeb3auth(web3authInstance);
  
        // Wait until the provider is available before proceeding
        if (web3authInstance && web3authInstance.provider) {
          setProvider(web3authInstance.provider);
        } else {
          console.error("Web3Auth provider not available.");
        }
  
        if (web3authInstance.connected && !storedAddress) {
          await fetchUserDetails();
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    };
  
    init();
  }, []);
  
  
  const loginTry = async () => {
    try {
      if (!web3auth) return;
      const web3authProvider = await connectWeb3Auth(web3auth);
      setProvider(web3authProvider);
      if (web3auth.connected) {
        setLoggedIn(true);
        await fetchUserDetails();
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      if (!web3auth) return;
      await disconnectWeb3Auth(web3auth);
      localStorage.removeItem(STORAGE_KEYS.ADDRESS);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
      localStorage.removeItem(STORAGE_KEYS.BALANCE);
      dispatch(setSafeAddress(''));
      setLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fetchUserDetails = () => {
    if (!provider || !web3auth) return;
    dispatch(userDetails(provider, RPC, web3auth));
  };

  const splitAddress = (address: string, charDisplayed: number = 6): string => {
    const firstPart = address.slice(0, charDisplayed);
    const lastPart = address.slice(-charDisplayed);
    return `${firstPart}...${lastPart}`;
  };

  const handleTransfer = async () => {
    if (!web3auth || !web3auth.connected || !provider) {
      console.error("Web3Auth is not connected or provider is not initialized.");
      return;
    }
  
    const recipientAddress = '0x7e0287D21A502E61CcC742Bc7AFC1b843fEc093E'
    const transferAmount = '1'
    const erc20Address = '0xb0e1C989E877e966bb2C7a7C83550f02cF69906F'
  
    try {
      await transferERC20WithGasToken(web3auth,erc20Address, recipientAddress, transferAmount);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  return (
    <>
      <Provider store={store}>
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
                          {safeAddress
                            ? splitAddress(safeAddress)
                            : "Loading..."}
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
                              {/* <li><Button onClick={handleTransfer}>Transfer</Button></li> */}
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
      </Provider>
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
