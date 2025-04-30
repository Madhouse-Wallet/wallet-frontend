import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTheme } from "@/ContextApi/ThemeContext";
import SideShiftWidget from "@/components/SideShift/SideShiftWidget";
import { useSelector } from "react-redux";
import LoadingScreen from "@/components/LoadingScreen";
import { createPortal } from "react-dom";
import { getUser } from "../../../lib/apiCall";
// css

// img

const PointOfSalePop = ({
  pointSale,
  setPointSale,
  refundBTC,
  setRefundBTC,
}) => {
  const { theme, toggleTheme } = useTheme();
  const userAuth = useSelector((state) => state.Auth);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [lnbitLink, setLnbitLink] = useState("jbmi6jUrxkXsTGFMygaUyk");
  const [lnbitLink2, setLnbitLink2] = useState("jbmi6jUrxkXsTGFMygaUyk");
  useEffect(() => {
    if (userAuth.email) {
      const fetchUser = async () => {
        try {
          const user = await getUser(userAuth.email);
          if (user) {
            console.log("user-->", user);
            setLnbitLink(user?.userId?.lnbitLinkId);
            setLnbitLink2(user?.userId?.lnbitLinkId_2 || "")
            setIsLoading(false); // stop loader if user found
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setIsLoading(false);
        }
      };

      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [userAuth.email]);

  const handlePointOfSale = () => setPointSale(!pointSale);
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <buttonbuy
          onClick={handlePointOfSale}
          className="bg-black/50 h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </buttonbuy>
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          {" "}
          <div className={`relative rounded px-3`}>
            <div className="top pb-3">
              {/* <h5 className="text-2xl font-bold leading-none -tracking-4 text-white/80">
                Add Supply
              </h5> */}
            </div>
            <div className="modalBody text-center">
              {isLoading && createPortal(<LoadingScreen />, document.body)}
              {/* <div className="py-2">
                <Link
                  href="/point-of-sale"
                  onClick={() => setPointSale(false)}
                  className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                >
                  Crypto Link
                </Link>
              </div> */}
              {step == 1 ? <>

                <div className="py-2">
                  <button
                    // href={`${process.env.NEXT_PUBLIC_LNBIT_URL}tpos/${lnbitLink}`}
                    // target="_blank"
                    // rel="noopener noreferrer"
                    onClick={() => setStep(2)}
                    className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    Terminal
                  </button>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      setPointSale(!pointSale);
                      setRefundBTC(!refundBTC);
                    }}
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    Refund
                  </button>
                </div>
              </> : step == "2" ? <>

                <div className="py-2">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_LNBIT_URL}tpos/${lnbitLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    USDC
                  </Link>
                </div>

                <div className="py-2">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_LNBIT_URL}tpos/${lnbitLink2}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full px-4 text-14 font-medium -tracking-1 transition-all duration-300 focus:outline-none focus-visible:ring-3 active:scale-100 min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    TBTC
                  </Link>
                </div></> : <></>}

              {/* {userAuth?.walletAddress && ( */}
              {/* <div className="py-2">
                <SideShiftWidget
                  // setPointSale={setPointSale}
                  // onClick={() => setPointSale(false)}
                  // pointSale={pointSale}
                  // parentAffiliateId={
                  //   process.env.NEXT_PUBLIC_SIDE_SHIFT_PARENT_ID
                  // }
                  // defaultDepositMethodId="btc"
                  // defaultSettleMethodId="usdcarb"
                  // theme="light"
                  // settleAddress={userAuth?.walletAddress}
                  buttonText="Refund"
                  buttonColor="rgb(232, 90, 67)"
                  textColor="rgb(17, 11, 11)"
                />
              </div> */}
              {/* )} */}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Modal = styled.div`
  padding-bottom: 100px;

  .modalDialog {
    max-height: calc(100vh - 160px);
    max-width: 350px !important;
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default PointOfSalePop;

const closeIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 16 15"
    fill="none"
  >
    <g clip-path="url(#clip0_0_6282)">
      <path
        d="M1.98638 14.906C1.61862 14.9274 1.25695 14.8052 0.97762 14.565C0.426731 14.0109 0.426731 13.1159 0.97762 12.5617L13.0403 0.498994C13.6133 -0.0371562 14.5123 -0.00735193 15.0485 0.565621C15.5333 1.08376 15.5616 1.88015 15.1147 2.43132L2.98092 14.565C2.70519 14.8017 2.34932 14.9237 1.98638 14.906Z"
        fill="var(--textColor)"
      />
      <path
        d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
        fill="var(--textColor)"
      />
    </g>
    <defs>
      <clipPath id="clip0_0_6282">
        <rect
          width="15"
          height="15"
          fill="var(--textColor)"
          transform="translate(0.564453)"
        />
      </clipPath>
    </defs>
  </svg>
);
