import React, { useState, useEffect, use } from "react";
import styled from "styled-components";
import Switch from "react-switch";
import { initializeWeb3Auth } from "../../lib/web3AuthIntialize";

import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tooltip";
import { useTheme } from "../../ContextApi/ThemeContext";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import LoginPop from "../Modals/LoginPop";
import { ethers } from "ethers";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { splitAddress } from "../../utils/globals";
import { passkeyValidator } from "../../lib/zeroDevWallet";
import { toast } from "react-toastify";
interface HeaderProps {
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ sidebar, setSidebar }) => {
  const userAuth = useSelector((state: any) => state.Auth);
  const { theme, toggleTheme } = useTheme();
  const [menu, setMenu] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<boolean>(false);
  const router = useRouter();
  const [login, setLogin] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dispatch = useDispatch();

  const reloadPasskey = async () => {
    if (userAuth.login && (!(userAuth?.pos))) {
      const {
        newPasskeyValidator = "",
        msg = "",
        status = "",
      } = await passkeyValidator(userAuth.webauthKey);
      console.log("newPasskeyValidator-->", newPasskeyValidator);
      let web3auth = await initializeWeb3Auth()
      if (status) {
        dispatch(
          loginSet({
            login: userAuth.login,
            username: userAuth.username,
            email: userAuth.email,
            pos:(userAuth?.pos || false),
            walletAddress: userAuth.walletAddress,
            passkeyCred: newPasskeyValidator,
            webauthKey: userAuth.webauthKey,
            id: userAuth.id,
            signer: userAuth.signer,
            multisigAddress: userAuth.multisigAddress,
            web3Auth: web3auth,
            passkey2: userAuth.passkey2,
            passkey3: userAuth.passkey3,
            ensName: userAuth.ensName || "",
            ensSetup: userAuth.ensSetup || false,
            multisigSetup: userAuth.multisigSetup,
            multisigActivate: userAuth.multisigActivate,
          })
        );
      }
    }
  };

  useEffect(() => {
    reloadPasskey();
  }, []);

  const logout = async () => {
    // await web3auth.logout();
    // localStorage.removeItem("user_balance");
    // localStorage.removeItem("user_info");
    // localStorage.removeItem("wallet_address");
    // localStorage.removeItem("provider");
    // setSafeAddress(null);
    // setLoggedIn(false);
    dispatch(
      loginSet({
        login: false,
        walletAddress: "",
        provider: "",
        signer: "",
        username: "",
        multisigAddress: "",
        passkey2: "",
        passkey3: "",
        ensName: "",
        ensSetup: false,
        multisigSetup: false,
        multisigActivate: false,
      })
    );
  };
  const [isCopied, setIsCopied] = useState({
    one: false,
    two: false,
    three: false,
  });

  const handleCopy = async (address: string, type: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied((prev) => ({ ...prev, [type]: true }));
      toast.success('Wallet Address copied successfully!');
      setTimeout(
        () =>
          setIsCopied({
            one: false,
            two: false,
            three: false,
          }),
        2000
      ); // Reset the copied state after 2 seconds
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
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
      <header className="siteHeader fixed top-0 py-2 w-full z-[999]">
        <div className="container mx-auto">
          <Nav className="flex items-center justify-between px-3 py-2 rounded-full shadow relative">
            {/* <div className="">
              <button
                onClick={() => setMenu(!menu)}
                aria-controls="navbarScroll"
                className="border-0 p-0"
              >
                <span className="block w-6 h-0.5 bg-[var(--textColor)] mb-1"></span>
                <span className="block w-6 h-0.5 bg-[var(--textColor)] mb-1"></span>
                <span className="block w-6 h-0.5 bg-[var(--textColor)]"></span>
              </button>
            </div> */}
            <div className="flex items-center gap-2">
              <a
                href="#"
                className=" font-normal text-base whitespace-nowrap flex items-center gap-2"
              >
                {/* {logo} */}
                {/* <span className="md:block hidden">MadHouse Wallet</span> */}
                <Image
                  src={process.env.NEXT_PUBLIC_IMAGE_URL + "logow1.png"}
                  alt="logo"
                  height={10000}
                  width={10000}
                  className="max-w-full object-contain w-auto smlogo"
                  // style={{ height: 28 }}
                />
              </a>
            </div>

            <Image
              src={process.env.NEXT_PUBLIC_IMAGE_URL + "logow.png"}
              alt="logo"
              height={10000}
              width={10000}
              className="max-w-full object-contain w-auto logo"
              // style={{ height: 28 }}
            />
            {/* <h4 className="m-0 font-bold themeClr sm:text-xl ">
              Madhouse Wallet
            </h4> */}
            <div
              className={`lg:flex items-center lg:justify-end gap-3 flex-wrap px-0 menu`}
              id="navbarScroll"
            >
              <div className="flex items-center gap-2 ms-auto flex-wrap justify-end">
                <Tooltip
                  id="theme"
                  style={{
                    background: "var(--textColor2)",
                    backdropFilter: "blur(12.8px)",
                    borderRadius: 30,
                    fontSize: 12,
                    color: "var(--backgroundColor2)",
                  }}
                />

                {userAuth.login ? (
                  <>
                    <button
                      onClick={() => handleCopy(userAuth?.walletAddress, "one")}
                      className="btn flex items-center justify-center commonBtn text-xs font-medium px-3 min-w-[80px] rounded-20"
                    >
                      {/* {userAuth?.username} */}
                      {userAuth?.walletAddress ? (
                        <>
                          {splitAddress(userAuth?.walletAddress)}{" "}
                          <span className="ml-1">{copyIcn}</span>
                        </>
                      ) : (
                        "Loading..."
                      )}
                    </button>
                    {/* <div className="dropdown dropdown-end">
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
                    </div> */}
                  </>
                ) : (
                  <Link
                    href={"/welcome"}
                    // onClick={loginTry}
                    // onClick={() => setLogin(!login)}
                    className="btn flex items-center justify-center commonBtn text-xs font-medium px-3 min-w-[80px] rounded-20"
                  >
                    Sign-Up/Login
                  </Link>
                )}
                {/* <button
                  className="border-0 p-0 bg-transpraent"
                  onClick={toggleTheme}
                  data-tooltip-id="theme"
                  data-tooltip-content={
                    !isChecked ? "Dark Theme" : "Light Theme"
                  }
                >
                  {!isChecked ? darkIcn : lightIcn}
                </button> */}
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
  // background: var(--cardBg);
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(12.8px);
  .logo {
    height: 28px;
  }
  .smlogo {
    height: 35px;
  }
  @media (max-width: 575px) {
    .logo {
      height: 15px;
    }
    .smlogo {
      height: 25px;
    }
    h4 {
      font-size: 10px;
    }
    .commonBtn {
      font-size: 10px !important;
    }
    button {
      padding: 5px;
      font-size: 12px !important;
      height: 35px !important;
    }
  }
  @media (max-width: 420px) {
    .logo {
      height: 10px;
    }
    .commonBtn {
      height: 30px !important;
      font-size: 6px;
    }
    .smlogo {
      height: 20px;
    }
  }
`;

export default Header;

const logo = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 53 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_4_18924)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.0702 7.44995H12.4302V14.15H7.0702V7.44995ZM7.0702 19.51H-0.299805V14.15H7.0702V19.51ZM12.4302 19.51V26.8799H7.0702V19.51H12.4302ZM12.4302 19.51H19.8002V14.15H12.4302V19.51Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M40.7133 30.5166H37.459V34.5755H33.3912V30.5166H32.3295V30.5077H28.5098V26.4398H32.3295V8.21582H28.5098V4.14792H33.3912V0.0800781H37.459V4.14792H40.7133V0.0800781H44.7812V4.14792H43.8049C48.7579 4.14792 51.8642 6.68789 51.8642 10.7264C51.8642 13.6138 49.7082 16.0261 46.9119 16.4459V16.5923C50.4933 16.8665 53.1252 19.4797 53.1252 22.9699C53.1252 27.4608 49.857 30.327 44.5453 30.5077H44.7812V34.5755H40.7133V30.5166ZM37.8488 8.25971V15.1125H41.8141C44.756 15.1125 46.4368 13.8148 46.4368 11.5856C46.4368 9.46544 44.9561 8.25971 42.3804 8.25971H37.8488ZM37.8488 26.4048H42.6C45.7794 26.4048 47.4969 25.0527 47.4969 22.5314C47.4969 20.0638 45.7241 18.7483 42.4715 18.7483H37.8496L37.8488 26.4048Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_4_18924">
        <rect width="53" height="35" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const copyIcn = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.60001 11.397C6.60001 8.671 6.60001 7.308 7.44301 6.461C8.28701 5.614 9.64401 5.614 12.36 5.614H15.24C17.955 5.614 19.313 5.614 20.156 6.461C21 7.308 21 8.671 21 11.397V16.217C21 18.943 21 20.306 20.156 21.153C19.313 22 17.955 22 15.24 22H12.36C9.64401 22 8.28701 22 7.44301 21.153C6.59901 20.306 6.60001 18.943 6.60001 16.217V11.397Z"
      fill="currentColor"
    />
    <path
      opacity="0.5"
      d="M4.172 3.172C3 4.343 3 6.229 3 10V12C3 15.771 3 17.657 4.172 18.828C4.789 19.446 5.605 19.738 6.792 19.876C6.6 19.036 6.6 17.88 6.6 16.216V11.397C6.6 8.671 6.6 7.308 7.443 6.461C8.287 5.614 9.644 5.614 12.36 5.614H15.24C16.892 5.614 18.04 5.614 18.878 5.804C18.74 4.611 18.448 3.792 17.828 3.172C16.657 2 14.771 2 11 2C7.229 2 5.343 2 4.172 3.172Z"
      fill="currentColor"
    />
  </svg>
);

const menuIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.5 7.00001C2.36739 7.00001 2.24021 6.94733 2.14645 6.85356C2.05268 6.75979 2 6.63262 2 6.50001V2.50101C2 2.3684 2.05268 2.24122 2.14645 2.14745C2.24021 2.05369 2.36739 2.00101 2.5 2.00101H6.5C6.63261 2.00101 6.75979 2.05369 6.85355 2.14745C6.94732 2.24122 7 2.3684 7 2.50101V6.50001C7 6.63262 6.94732 6.75979 6.85355 6.85356C6.75979 6.94733 6.63261 7.00001 6.5 7.00001H2.5ZM9.5 7.00001C9.36739 7.00001 9.24021 6.94733 9.14645 6.85356C9.05268 6.75979 9 6.63262 9 6.50001V2.50101C9 2.3684 9.05268 2.24122 9.14645 2.14745C9.24021 2.05369 9.36739 2.00101 9.5 2.00101H13.499C13.6316 2.00101 13.7588 2.05369 13.8526 2.14745C13.9463 2.24122 13.999 2.3684 13.999 2.50101V6.50001C13.999 6.63262 13.9463 6.75979 13.8526 6.85356C13.7588 6.94733 13.6316 7.00001 13.499 7.00001H9.5ZM2.5 14C2.36739 14 2.24021 13.9473 2.14645 13.8536C2.05268 13.7598 2 13.6326 2 13.5V9.50001C2 9.3674 2.05268 9.24022 2.14645 9.14645C2.24021 9.05269 2.36739 9.00001 2.5 9.00001H6.5C6.63261 9.00001 6.75979 9.05269 6.85355 9.14645C6.94732 9.24022 7 9.3674 7 9.50001V13.5C7 13.6326 6.94732 13.7598 6.85355 13.8536C6.75979 13.9473 6.63261 14 6.5 14H2.5ZM9.5 14C9.36739 14 9.24021 13.9473 9.14645 13.8536C9.05268 13.7598 9 13.6326 9 13.5V9.50001C9 9.3674 9.05268 9.24022 9.14645 9.14645C9.24021 9.05269 9.36739 9.00001 9.5 9.00001H13.499C13.6316 9.00001 13.7588 9.05269 13.8526 9.14645C13.9463 9.24022 13.999 9.3674 13.999 9.50001V13.5C13.999 13.6326 13.9463 13.7598 13.8526 13.8536C13.7588 13.9473 13.6316 14 13.499 14H9.5Z"
      fill="currentColor"
    />
  </svg>
);

const lightIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12 2C12.2652 2 12.5196 2.10536 12.7071 2.29289C12.8946 2.48043 13 2.73478 13 3V4C13 4.26522 12.8946 4.51957 12.7071 4.70711C12.5196 4.89464 12.2652 5 12 5C11.7348 5 11.4804 4.89464 11.2929 4.70711C11.1054 4.51957 11 4.26522 11 4V3C11 2.73478 11.1054 2.48043 11.2929 2.29289C11.4804 2.10536 11.7348 2 12 2ZM2 12C2 11.7348 2.10536 11.4804 2.29289 11.2929C2.48043 11.1054 2.73478 11 3 11H4C4.26522 11 4.51957 11.1054 4.70711 11.2929C4.89464 11.4804 5 11.7348 5 12C5 12.2652 4.89464 12.5196 4.70711 12.7071C4.51957 12.8946 4.26522 13 4 13H3C2.73478 13 2.48043 12.8946 2.29289 12.7071C2.10536 12.5196 2 12.2652 2 12ZM19 12C19 11.7348 19.1054 11.4804 19.2929 11.2929C19.4804 11.1054 19.7348 11 20 11H21C21.2652 11 21.5196 11.1054 21.7071 11.2929C21.8946 11.4804 22 11.7348 22 12C22 12.2652 21.8946 12.5196 21.7071 12.7071C21.5196 12.8946 21.2652 13 21 13H20C19.7348 13 19.4804 12.8946 19.2929 12.7071C19.1054 12.5196 19 12.2652 19 12ZM13 20C13 19.7348 12.8946 19.4804 12.7071 19.2929C12.5196 19.1054 12.2652 19 12 19C11.7348 19 11.4804 19.1054 11.2929 19.2929C11.1054 19.4804 11 19.7348 11 20V21C11 21.2652 11.1054 21.5196 11.2929 21.7071C11.4804 21.8946 11.7348 22 12 22C12.2652 22 12.5196 21.8946 12.7071 21.7071C12.8946 21.5196 13 21.2652 13 21V20ZM18.364 16.95C18.2718 16.8545 18.1614 16.7783 18.0394 16.7259C17.9174 16.6735 17.7862 16.6459 17.6534 16.6447C17.5206 16.6436 17.3889 16.6689 17.266 16.7192C17.1432 16.7695 17.0315 16.8437 16.9376 16.9376C16.8437 17.0315 16.7695 17.1432 16.7192 17.266C16.6689 17.3889 16.6436 17.5206 16.6447 17.6534C16.6459 17.7862 16.6735 17.9174 16.7259 18.0394C16.7783 18.1614 16.8545 18.2718 16.95 18.364L17.657 19.071C17.8456 19.2532 18.0982 19.354 18.3604 19.3517C18.6226 19.3494 18.8734 19.2442 19.0588 19.0588C19.2442 18.8734 19.3494 18.6226 19.3517 18.3604C19.354 18.0982 19.2532 17.8456 19.071 17.657L18.364 16.95ZM4.929 4.929C5.11653 4.74153 5.37084 4.63621 5.636 4.63621C5.90116 4.63621 6.15547 4.74153 6.343 4.929L7.05 5.636C7.23216 5.8246 7.33295 6.0772 7.33067 6.3394C7.3284 6.6016 7.22323 6.85241 7.03782 7.03782C6.85241 7.22323 6.6016 7.3284 6.3394 7.33067C6.0772 7.33295 5.8246 7.23216 5.636 7.05L4.929 6.343C4.74153 6.15547 4.63621 5.90116 4.63621 5.636C4.63621 5.37084 4.74153 5.11653 4.929 4.929ZM7.05 18.364C7.14551 18.2718 7.22169 18.1614 7.2741 18.0394C7.32651 17.9174 7.3541 17.7862 7.35525 17.6534C7.3564 17.5206 7.3311 17.3889 7.28082 17.266C7.23054 17.1432 7.15629 17.0315 7.0624 16.9376C6.9685 16.8437 6.85685 16.7695 6.73395 16.7192C6.61106 16.6689 6.47938 16.6436 6.3466 16.6447C6.21382 16.6459 6.0826 16.6735 5.9606 16.7259C5.83859 16.7783 5.72825 16.8545 5.636 16.95L4.929 17.657C4.83349 17.7492 4.75731 17.8596 4.7049 17.9816C4.65249 18.1036 4.6249 18.2348 4.62375 18.3676C4.6226 18.5004 4.6479 18.6321 4.69818 18.755C4.74846 18.8778 4.82271 18.9895 4.9166 19.0834C5.0105 19.1773 5.12215 19.2515 5.24505 19.3018C5.36794 19.3521 5.49962 19.3774 5.6324 19.3763C5.76518 19.3751 5.8964 19.3475 6.0184 19.2951C6.14041 19.2427 6.25075 19.1665 6.343 19.071L7.05 18.364ZM19.071 4.929C19.2585 5.11653 19.3638 5.37084 19.3638 5.636C19.3638 5.90116 19.2585 6.15547 19.071 6.343L18.364 7.05C18.2718 7.14551 18.1614 7.22169 18.0394 7.2741C17.9174 7.32651 17.7862 7.3541 17.6534 7.35525C17.5206 7.3564 17.3889 7.3311 17.266 7.28082C17.1432 7.23054 17.0315 7.15629 16.9376 7.0624C16.8437 6.9685 16.7695 6.85685 16.7192 6.73395C16.6689 6.61106 16.6436 6.47938 16.6447 6.3466C16.6459 6.21382 16.6735 6.0826 16.7259 5.9606C16.7783 5.83859 16.8545 5.72825 16.95 5.636L17.657 4.929C17.8445 4.74153 18.0988 4.63621 18.364 4.63621C18.6292 4.63621 18.8835 4.74153 19.071 4.929ZM7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12Z"
      fill="currentColor"
    />
  </svg>
);
const darkIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.844 3.344L14.416 4.125L15.844 4.906L16.625 6.334L17.406 4.906L18.834 4.125L17.406 3.344L16.625 1.916L15.844 3.344ZM10.412 4.158C9.10231 4.42374 7.88006 5.01334 6.85685 5.87296C5.83364 6.73258 5.04207 7.83483 4.55443 9.07906C4.06679 10.3233 3.89861 11.6699 4.06525 12.9958C4.23189 14.3217 4.72804 15.5848 5.5084 16.6697C6.28875 17.7546 7.32845 18.6267 8.53255 19.2064C9.73664 19.7861 11.0668 20.0549 12.4015 19.9883C13.7362 19.9217 15.033 19.5218 16.1734 18.8251C17.3138 18.1284 18.2615 17.1572 18.93 16C16.5552 15.9815 14.284 15.0252 12.6112 13.3393C10.9385 11.6535 9.99993 9.37487 10 7C10 6.02 10.131 5.063 10.412 4.158ZM2 12C2 6.477 6.477 2 12 2H13.734L12.866 3.5C12.287 4.5 12 5.69 12 7C11.9998 8.03362 12.2286 9.05444 12.6698 9.98915C13.1111 10.9239 13.7538 11.7493 14.5519 12.4061C15.35 13.0629 16.2837 13.5348 17.2858 13.7879C18.288 14.041 19.3337 14.069 20.348 13.87L22.03 13.543L21.487 15.169C20.162 19.137 16.417 22 12 22C6.477 22 2 17.523 2 12ZM20.5 6.416L21.414 8.086L23.084 9L21.414 9.914L20.5 11.584L19.586 9.914L17.916 9L19.586 8.086L20.5 6.416Z"
      fill="currentColor"
    />
  </svg>
);
