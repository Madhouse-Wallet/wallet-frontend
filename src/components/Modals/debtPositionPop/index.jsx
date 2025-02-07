import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getAccount, getProvider } from "@/lib/zeroDevWallet";

// css

// img

const DebtPositionPop = ({ debtPosition, setDebtPosition, fetchTroveData }) => {
  const [providerr, setProviderr] = useState(null);
  const userAuth = useSelector((state) => state.Auth);
  const calculateCollateralAmount = (baseAmount) => {
    if (!baseAmount) return 0;
    const fixedValue = 200;
    const percentage = 0.005; // 0.5% in decimal

    const collateralAmount = baseAmount + fixedValue + baseAmount * percentage;
    return collateralAmount;
  };

  const [step, setStep] = useState(1);
  const [borrowingAmount, setBorrowingAmount] = useState(0); // State for Borrowing Amount (USD)
  const [ltv, setLtv] = useState(1.3); // State for Safe (1.3), Moderate (1.2), Risky (1.1)
  const [currentBTCPrice, setCurrentBTCPrice] = useState(0);
  const [baseCollateralRatio, setBaseCollataeralRatio] = useState();
  const [error, setError] = useState("");
  const [depositButton, setDepositButton] = useState(false);

  const fetchCollateralData = async () => {
    try {
      console.log("inside ttry");
      const response = await fetch("/api/get-collateralData", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("ddddd", data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch collateral data");
      }

      if (data.status === "success") {
        console.log("ddddd", data?.collateralData?.currentCollateralRatio);
        setBaseCollataeralRatio(data?.collateralData?.currentCollateralRatio);
      } else {
        setBaseCollataeralRatio(null);
      }
    } catch (err) {
      setBaseCollataeralRatio(null);
    }
  };

  console.log("llllllll", baseCollateralRatio);
  const handleDebtPosition = () => setDebtPosition(!debtPosition);

  // const calculateRecommendedCollateral = (borrowingAmount, btcPrice, ltv) => {
  //   if (!btcPrice || !ltv || !borrowingAmount) return 0;
  //   return (borrowingAmount / (btcPrice * (1 / ltv))).toFixed(8);
  // };

  const calculateRecommendedCollateral = (borrowingAmount, btcPrice, ltv) => {
    if (!btcPrice || !ltv || !borrowingAmount) return 0;
    const baseRatio = baseCollateralRatio * ltv;
    const feeWithBorrowerAmount = calculateCollateralAmount(borrowingAmount);
    return ((feeWithBorrowerAmount * baseRatio) / (btcPrice * 100)).toFixed(8);
  };

  const recommendedCollateral = calculateRecommendedCollateral(
    calculateCollateralAmount(borrowingAmount),
    currentBTCPrice,
    ltv
  );

  async function addUserCollateral(data) {
    try {
      const response = await fetch("/api/add-collateral", {
        // Replace with the actual API route
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }
      return result;
    } catch (error) {
      console.error("Error calling API:", error);
      return { error: error.message };
    }
  }

  const openTrove = async (borrowingAmount) => {
    if (!providerr) {
      return toast.error("Please Connect to wallet");
    }
    setDepositButton(true);
    const web3 = new Web3Interaction("sepolia", providerr);
    console.log("line-58");
    const contractAddress =
      process.env.NEXT_PUBLIC_THRESHOLD_WITHDRWAL_CONTRACT_ADDRESS;
    const upperHint =
      process.env.NEXT_PUBLIC_THRESHOLD_UPPERHINT_CONTRACT_ADDRESS;
    const lowerHint =
      process.env.NEXT_PUBLIC_THRESHOLD_LOWERHINT_CONTRACT_ADDRESS;
    const collateralAmount = ethers.utils.parseEther("0.01");
    const maxFeePercentage = ethers.utils.parseEther(
      borrowingAmount.toString()
    );
    const recommendedCollaterall = ethers.utils.parseEther(
      recommendedCollateral.toString()
    );
    let account = await getAccount(userAuth?.passkeyCred);
    try {
      const MAX_UINT256 =
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      const approve = await web3.approve(
        process.env.NEXT_PUBLIC_THRESHOLD_TBTC_CONTRACT_ADDRESS,
        contractAddress,
        MAX_UINT256
      );
      console.log("approve", approve);
      console.log(
        "line-74",
        BigInt(maxFeePercentage.toString()),
        BigInt(collateralAmount.toString()),
        BigInt(recommendedCollaterall.toString())
      );
      const result = await web3.openTrove(
        contractAddress,
        "0",
        maxFeePercentage,
        collateralAmount,
        recommendedCollaterall,
        upperHint,
        lowerHint,
        account?.kernelClient
      );
      console.log("resultresult", result);
      fetchTroveData(providerr);
      setDebtPosition(false);
      toast.success("Transaction Completed");
      const userData = {
        userId: "67a0b4711547e9d5b11dc825",
        email: "heramb@yopmail.com",
        colleralAmount: recommendedCollaterall,
        borrowAmount: maxFeePercentage,
        walletAddress: account?.address,
      };

      addUserCollateral(userData).then((response) => console.log(response));
    } catch (error) {
      console.log("Open trove Error", error);
      toast.error(error);
      setDepositButton(false);
    }
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       if (userAuth?.passkeyCred) {
  //         let account = await getAccount(userAuth?.passkeyCred);
  //         console.log("account---<", account);
  //         if (account) {
  //           let provider = await getProvider(account.kernelClient);
  //           console.log("provider-->", provider);
  //           if (provider) {
  //             console.log("provider -line-114", provider);
  //             setProviderr(provider?.ethersProvider);
  //             const contractAddress =
  //               process.env.NEXT_PUBLIC_ETH_PRICE_CONTRACT_ADDRESS;
  //             const web3 = new Web3Interaction(
  //               "sepolia",
  //               provider?.ethersProvider
  //             );
  //             const receipt = await web3.fetchPrice(contractAddress);
  //             const receiptInEther = ethers.utils.formatEther(receipt);
  //             const adjustedPrice =
  //               parseFloat(receiptInEther) * Math.pow(10, 10);
  //             setCurrentBTCPrice(adjustedPrice);
  //             fetchCollateralData()
  //           } else {
  //             console.log("No wallet detected. Please install Metamask.");
  //             return;
  //           }
  //         }
  //       }
  //     } catch (error) {}
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userAuth?.passkeyCred) {
          let account = await getAccount(userAuth?.passkeyCred);
          console.log("account---<", account);
          if (account) {
            let provider = await getProvider(account.kernelClient);
            console.log("provider-->", provider);
            if (provider) {
              console.log("provider -line-114", provider);
              setProviderr(provider?.ethersProvider);
              const contractAddress =
                process.env.NEXT_PUBLIC_ETH_PRICE_CONTRACT_ADDRESS;
              const web3 = new Web3Interaction(
                "sepolia",
                provider?.ethersProvider
              );
              const receipt = await web3.fetchPrice(contractAddress);
              const receiptInEther = ethers.utils.formatEther(receipt);
              const adjustedPrice =
                parseFloat(receiptInEther) * Math.pow(10, 10);
              setCurrentBTCPrice(adjustedPrice);
              fetchCollateralData();
            } else {
              console.log("No wallet detected. Please install Metamask.");
              return;
            }
          }
        }
      } catch (error) {}
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("line-244")
        const contractAddress =
          process.env.NEXT_PUBLIC_ETH_PRICE_CONTRACT_ADDRESS;
        const web3 = new Web3Interaction("sepolia",null);
        console.log("web3",web3)
        const receipt = await web3.fetchPrice(contractAddress);
        console.log("receipt",receipt)
        const receiptInEther = ethers.utils.formatEther(receipt);
        const adjustedPrice = parseFloat(receiptInEther) * Math.pow(10, 10);
        setCurrentBTCPrice(adjustedPrice);
        fetchCollateralData();
      } catch (error) {}
    };

    fetchData();
  }, []);
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <button
          onClick={handleDebtPosition}
          className="bg-[#0d1017] h-10 w-10 items-center rounded-20 p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center"
          style={{ border: "1px solid #5f5f5f59" }}
        >
          {closeIcn}
        </button>
        <div className="absolute inset-0 backdrop-blur-xl"></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-20   z-10 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] w-full`}
        >
          {" "}
          <div className={`relative rounded px-3`}>
            <div className="top pb-3">
              <h5 className="m-0 text-xl fw-bold">
                {step == 1 ? "Open a Debt Position" : "Debt Position Summary"}{" "}
              </h5>
            </div>
            <div className="modalBody">
              {step == 1 ? (
                <>
                  <form action="">
                    <div className="py-2">
                      <label
                        htmlFor=""
                        className="form-label m-0 text-xs text-gray-400 pb-1 font-medium"
                      >
                        Borrowing Amount (THUSD)
                      </label>
                      <input
                        type="text"
                        value={borrowingAmount}
                        // onChange={(e) => setBorrowingAmount(Number(e.target.value))}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) {
                            if (value >= 1800) {
                              setBorrowingAmount(Number(value));
                              setError("");
                            } else {
                              setBorrowingAmount(Number(value));
                              setError(
                                "Borrowing Amount must be greater than 1800"
                              );
                            }
                          }
                        }}
                        className="form-control bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)]  border-gray-600 text-xs font-medium"
                      />
                    </div>
                    <div className="py-2">
                      <label
                        htmlFor=""
                        className="form-label m-0 text-xs text-gray-400 pb-1 font-medium"
                      >
                        Recommended Collateral amount (TBTC)
                      </label>
                      <input
                        type="number"
                        value={recommendedCollateral}
                        readOnly
                        className="form-control bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)]  border-gray-600 focus:border-gray-600 text-xs font-medium"
                      />
                    </div>
                    {error && (
                      <div className="text-red-500 text-xs mt-1">{error}</div>
                    )}
                    <div className="py-2">
                      <RadioList className="list-none ps-0 my-4 mb-0 flex items-center justify-center gap-3">
                        <li className="relative">
                          <input
                            type="radio"
                            checked={ltv === 1.3 && true}
                            name="wallet"
                            className="absolute h-full cursor-pointer w-full opacity-0"
                            onChange={() => setLtv(1.3)}
                          />
                          <button className="flex items-center justify-center px-3 py-2">
                            Safe (LTV 1.3)
                          </button>
                        </li>
                        <li className="relative">
                          <input
                            type="radio"
                            checked={ltv === 1.2 && true}
                            name="wallet"
                            className="absolute h-full cursor-pointer w-full opacity-0"
                            onChange={() => setLtv(1.2)}
                          />
                          <button className="flex items-center justify-center px-3 py-2">
                            Moderate (LTV 1.2)
                          </button>
                        </li>
                        <li className="relative">
                          <input
                            type="radio"
                            name="wallet"
                            checked={ltv === 1.1 && true}
                            className="absolute h-full cursor-pointer w-full opacity-0"
                            onChange={() => setLtv(1.1)}
                          />
                          <button className="flex items-center justify-center px-3 py-2">
                            Risky (LTV 1.1)
                          </button>
                        </li>
                      </RadioList>
                    </div>
                    <div className="btnWrpper mt-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex items-center justify-center btn commonBtn w-full"
                        disabled={
                          borrowingAmount === 0 || error !== "" ? true : false
                        }
                      >
                        Next
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="py-2">
                    <ul className="list-none pl-0 mb-0 pt-3">
                      <li
                        className="py-2 flex items-center justify-between"
                        style={{ borderBottom: "1px dashed #525252" }}
                      >
                        <span className="text-xs text-gray-500">
                          Collateral Needed
                        </span>
                        <span className="text-xs font-semibold">
                          {recommendedCollateral} BTC
                        </span>
                      </li>
                      {/* <li
                        className="py-2 flex items-center justify-between"
                        style={{ borderBottom: "1px dashed #525252" }}
                      >
                        <span className="text-xs text-gray-500">
                          Loan to Value
                        </span>
                        <span className="text-xs font-semibold">{ltv}</span>
                      </li> */}
                      <li
                        className="py-2 flex items-center justify-between"
                        style={{ borderBottom: "1px dashed #525252" }}
                      >
                        <span className="text-xs text-gray-500">Fees</span>
                        <span className="text-xs font-semibold">
                          $
                          {calculateCollateralAmount(borrowingAmount) -
                            borrowingAmount}
                        </span>
                      </li>

                      <li
                        className="py-2 flex items-center justify-between"
                        style={{ borderBottom: "1px dashed #525252" }}
                      >
                        <span className="text-xs text-gray-500">
                          Collateral Ratio
                        </span>
                        <span className="text-xs font-semibold">
                          {(
                            (recommendedCollateral * currentBTCPrice * 100) /
                            calculateCollateralAmount(borrowingAmount)
                          ).toFixed(1)}{" "}
                          %
                        </span>
                      </li>

                      <li
                        className="py-2 flex items-center justify-between"
                        style={{ borderBottom: "1px dashed #525252" }}
                      >
                        <span className="text-xs text-gray-500">
                          Loan to Value (LTV)
                        </span>
                        <span className="text-xs font-semibold">
                          {(
                            (calculateCollateralAmount(borrowingAmount) * 100) /
                            (recommendedCollateral * currentBTCPrice)
                          ).toFixed(1)}{" "}
                          %
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="btnWrpper mt-3">
                    <button
                      type="button"
                      className="flex items-center justify-center btn commonBtn w-full"
                      onClick={() => openTrove(borrowingAmount)}
                      disabled={depositButton}
                    >
                      {depositButton ? "Depositing..." : "Deposit"}
                    </button>
                  </div>
                </>
              )}
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
    max-width: 500px !important;
    padding-bottom: 40px !important;
    input {
      color: var(--textColor);
    }
  }
`;

const RadioList = styled.ul`
  button {
    font-size: 12px;
    background: var(--cardBg);
    border-color: var(--cardBg);
  }
  input:checked + button {
    background: #ff8735;
    border-color: #ff8735;
    color: #000;
  }
`;

export default DebtPositionPop;

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
