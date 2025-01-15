import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";

// css

// img

const DebtPositionPop = ({ debtPosition, setDebtPosition,fetchTroveData }) => {
  const calculateCollateralAmount = (baseAmount) => {
    if (!baseAmount) return 0;
    const fixedValue = 200;
    const percentage = 0.005; // 0.5% in decimal

    const collateralAmount = baseAmount + fixedValue + baseAmount * percentage;
    return collateralAmount;
  };

  const [step, setStep] = useState(1);
  const [borrowingAmount, setBorrowingAmount] = useState(0); // State for Borrowing Amount (USD)
  const [ltv, setLtv] = useState(2); // State for Safe (2), Moderate (1.5), Risky (1.25)
  const [currentBTCPrice, setCurrentBTCPrice] = useState(0);
  const [error, setError] = useState("");
  const [depositButton, setDepositButton] = useState(false);

  const handleDebtPosition = () => setDebtPosition(!debtPosition);

  const calculateRecommendedCollateral = (borrowingAmount, btcPrice, ltv) => {
    if (!btcPrice || !ltv || !borrowingAmount) return 0;
    return (borrowingAmount / (btcPrice * (1 / ltv))).toFixed(8); // BTC amount rounded to 8 decimals
  };

  const recommendedCollateral = calculateRecommendedCollateral(
    calculateCollateralAmount(borrowingAmount),
    currentBTCPrice,
    ltv
  );
  const openTrove = async (borrowingAmount) => {
    const provider = window.ethereum; // Ensure user has a wallet extension
    if (!provider) {
      return  toast.error("Please Coonect to wallet");
    }
    setDepositButton(true)
    const web3 = new Web3Interaction("sepolia", provider);

    const contractAddress = process.env.NEXT_PUBLIC_THRESHOLD_WITHDRWAL_CONTRACT_ADDRESS;
    const upperHint = process.env.NEXT_PUBLIC_THRESHOLD_UPPERHINT_CONTRACT_ADDRESS;
    const lowerHint = process.env.NEXT_PUBLIC_THRESHOLD_LOWERHINT_CONTRACT_ADDRESS;
    const collateralAmount = ethers.utils.parseEther("0.01");
    const maxFeePercentage = ethers.utils.parseEther(
      borrowingAmount.toString()
    );
    const recommendedCollaterall = ethers.utils.parseEther(
      recommendedCollateral.toString()
    );

    try {
     const result =  await web3.openTrove(
        contractAddress,
        "0",
        maxFeePercentage,
        collateralAmount,
        recommendedCollaterall,
        upperHint,
        lowerHint
      );
      fetchTroveData(provider)
      setDebtPosition(false)
      toast.success("Transaction Completed")
    } catch (error) {
      toast.error(error)
      setDepositButton(false)
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provider = window.ethereum; // Ensure user has a wallet extension
        if (!provider) {
          console.log("No wallet detected. Please install Metamask.");
          return;
        }
        const contractAddress = process.env.NEXT_PUBLIC_ETH_PRICE_CONTRACT_ADDRESS;
        const web3 = new Web3Interaction("sepolia", provider);
        const receipt = await web3.fetchPrice(contractAddress);
        const receiptInEther = ethers.utils.formatEther(receipt);
        const adjustedPrice = parseFloat(receiptInEther) * Math.pow(10, 10);
        setCurrentBTCPrice(adjustedPrice);
      } catch (error) {
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <div
          className={`modalDialog relative p-2 mx-auto w-full rounded-lg z-10 bg-[var(--backgroundColor)]`}
        >
          <div className={`position-relative rounded px-3`}>
            <button
              onClick={handleDebtPosition}
              className="border-0 p-0 absolute"
              variant="transparent"
              style={{ right: 10, top: 0 }}
            >
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
            </button>
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
                        Borrowing Amount (USD)
                      </label>
                      <input
                        type="text"
                        value={borrowingAmount}
                        // onChange={(e) => setBorrowingAmount(Number(e.target.value))}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) {
                            if(value >= 1800){
                              setBorrowingAmount(Number(value));
                              setError('')
                            }else{
                              setBorrowingAmount(Number(value));
                              setError("Borrowing Amount must be greater than 1800")
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
                        Recommended Collateral amount (BTC)
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
                        <li className="position-relative">
                          <input
                            type="radio"
                            checked={ltv === 2 && true}
                            name="wallet"
                            className="absolute h-full cursor-pointer w-full opacity-0"
                            onChange={() => setLtv(2)}
                          />
                          <button className="flex items-center justify-center px-3 py-2">
                            Safe (LTV 2)
                          </button>
                        </li>
                        <li className="position-relative">
                          <input
                            type="radio"
                            checked={ltv === 1.5 && true}
                            name="wallet"
                            className="absolute h-full cursor-pointer w-full opacity-0"
                            onChange={() => setLtv(1.5)}
                          />
                          <button className="flex items-center justify-center px-3 py-2">
                            Moderate (LTV 1.5)
                          </button>
                        </li>
                        <li className="position-relative">
                          <input
                            type="radio"
                            name="wallet"
                            checked={ltv === 1.25 && true}
                            className="absolute h-full cursor-pointer w-full opacity-0"
                            onChange={() => setLtv(1.25)}
                          />
                          <button className="flex items-center justify-center px-3 py-2">
                            Risky (LTV 1.25)
                          </button>
                        </li>
                      </RadioList>
                    </div>
                    <div className="btnWrpper mt-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex items-center justify-center btn commonBtn w-full"
                        disabled={borrowingAmount === 0 || error !== '' ? true : false}
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
                      <li
                        className="py-2 flex items-center justify-between"
                        style={{ borderBottom: "1px dashed #525252" }}
                      >
                        <span className="text-xs text-gray-500">
                          Loan to Value
                        </span>
                        <span className="text-xs font-semibold">{ltv}</span>
                      </li>
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
  .modalDialog {
    max-width: 500px;
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