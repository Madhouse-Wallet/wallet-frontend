import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tooltip";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import LoginPop from "../Modals/LoginPop";
import { loginSet } from "../../lib/redux/slices/auth/authSlice";
import { splitAddress } from "../../utils/globals";
import { passkeyValidator } from "../../lib/zeroDevWallet";
import { toast } from "react-toastify";
interface HeaderProps {
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = () => {
  const userAuth = useSelector((state: any) => state.Auth);
  const [login, setLogin] = useState<boolean>(false);
  const dispatch = useDispatch();

  const reloadPasskey = async () => {
    if (userAuth.login && !userAuth?.pos) {
      const {
        newPasskeyValidator = "",
        msg = "",
        status = "",
      } = await passkeyValidator(userAuth.webauthKey);
      if (status) {
        dispatch(
          loginSet({
            login: userAuth.login,
            username: userAuth.username,
            email: userAuth.email,
            pos: userAuth?.pos || false,
            walletAddress: userAuth.walletAddress,
            bitcoinWallet: userAuth.bitcoinWallet,
            passkeyCred: newPasskeyValidator,
            webauthKey: userAuth.webauthKey,
            id: userAuth.id,
            signer: userAuth.signer,
            multisigAddress: userAuth.multisigAddress,
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

  const [isCopied, setIsCopied] = useState({
    one: false,
    two: false,
    three: false,
  });

  const handleCopy = async (address: string, type: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied((prev) => ({ ...prev, [type]: true }));
      toast.success("Wallet Address copied successfully!");
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
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className=" font-normal text-base whitespace-nowrap flex items-center gap-2"
              >
                <Image
                  src={process.env.NEXT_PUBLIC_IMAGE_URL + "logow1.png"}
                  alt="logo"
                  height={10000}
                  width={10000}
                  className="max-w-full object-contain w-auto smlogo"
                />
              </Link>
            </div>

            <Image
              src={process.env.NEXT_PUBLIC_IMAGE_URL + "logow.png"}
              alt="logo"
              height={10000}
              width={10000}
              className="max-w-full object-contain w-auto logo"
            />

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
                      {userAuth?.walletAddress ? (
                        <>
                          {splitAddress(userAuth?.walletAddress)}{" "}
                          <span className="ml-1">{copyIcn}</span>
                        </>
                      ) : (
                        "Loading..."
                      )}
                    </button>
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
              </div>
            </div>
          </Nav>
        </div>
      </header>
    </>
  );
};

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

