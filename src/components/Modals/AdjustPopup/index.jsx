import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getProvider,getAccount } from "@/lib/zeroDevWallet";


// css

// img

const AdjustPopup = ({
  adjustPop,
  setAdjustPop,
  supply,
  debtvalue,
  fetchTroveData,
}) => {
  console.log("debtvalue",debtvalue)
  const userAuth = useSelector((state) => state.Auth);
  const [supplyAmount, setSupplyAmount] = useState(supply);
  const [totalDebtAmount, settotalDebtAmount] = useState();
  const [changeInput, setChangeInput] = useState(false);
  const [nextButton, setNextButton] = useState(false);
  const [borrowingFeee, setBorrowingFeee] = useState();
  const [debtAmount, setDebtAmount] = useState(debtvalue === '0.0' || debtvalue === '0'? 0 : debtvalue - 200 );
  const [error, setError] = useState("");
  const [debtError, setDebtError] = useState("");
  const [collRatio, setCollRatio] = useState();
  const [providerr, setProviderr] = useState(null);

  const borrowingFee = async () => {
    if (isNaN(debtvalue) || isNaN(debtAmount)) {
      toast.error("Invalid debt values provided");
      return;
    }

    // Convert to numbers
    const netDebt = Number(debtvalue) - 200;
    const debtAmountNum = Number(debtAmount);

    // Calculate absolute difference
    const differenceAmount = Math.abs(debtAmountNum - netDebt);

    // Calculate borrowing fee (0.5% of the difference)
    const borrowingFeePercentage = 0.005; // 0.5%
    let borrowingAmount = differenceAmount * borrowingFeePercentage;

    // Limit to 2 decimal places
    borrowingAmount = parseFloat(borrowingAmount);

    // Update states
    setBorrowingFeee(borrowingAmount);
    const totalDebt = debtAmountNum + 200 + borrowingAmount;
    settotalDebtAmount(parseFloat(totalDebt));

    calculateCollateralAndHealthFactor(supplyAmount, totalDebt);
  };

  const addSupply = async () => {
  
    if (!providerr) {
      return toast.error("Please Connect to wallet");
    }
    setNextButton(true)
    const web3 = new Web3Interaction("sepolia", providerr);

    const contractAddress = process.env.NEXT_PUBLIC_THRESHOLD_WITHDRWAL_CONTRACT_ADDRESS;
    const lowerHint = process.env.NEXT_PUBLIC_THRESHOLD_LOWERHINT_CONTRACT_ADDRESS;
    const maxFeePercentage = ethers.utils.parseEther("0.01");

    let updatedSupplyAmount = supplyAmount;
    let updatedDebtAmount = debtAmount;

    // Calculate the absolute difference
    const supplyDifference = supplyAmount - supply; // Difference between supplyAmount and supply
    updatedSupplyAmount = Math.abs(supplyDifference);

    const debtDifference = debtAmount - (debtvalue - 200);
    updatedDebtAmount = Math.abs(debtDifference);

    const callWithFalse = debtAmount > debtvalue - 200 ? true : false;

    let upperHint =
      callWithFalse === true
        ? process.env.NEXT_PUBLIC_THRESHOLD_UPPERHINT_CONTRACT_ADDRESS
        : process.env.NEXT_PUBLIC_THRESHOLD_LOWERHINT_CONTRACT_ADDRESS;

    // Set supplyValue and supplyAmountInWei based on the sign of supplyDifference
    let supplyValue;
    let supplyAmountInWei;

    if (supplyDifference > 0) {
      supplyValue = ethers.utils.parseEther(updatedSupplyAmount.toString()); // Positive difference
      supplyAmountInWei = ethers.utils.parseEther("0"); // Zero in Wei
    } else {
      supplyValue = ethers.utils.parseEther("0"); // Zero supplyValue
      supplyAmountInWei = ethers.utils.parseEther(
        updatedSupplyAmount.toString()
      ); // Positive difference in Wei
    }

    const debtAmountInWei = ethers.utils.parseEther(
      updatedDebtAmount.toString()
    );

    let account = await getAccount(userAuth?.passkeyCred);
    try {
      await web3.adjustTrove(
        contractAddress,
        maxFeePercentage,
        supplyAmountInWei,
        debtAmountInWei,
        callWithFalse,
        "0",
        upperHint,
        lowerHint,
        supplyValue,
        account.kernelClient
      );
      toast.success(`Transaction Successfull`);
      setAdjustPop(false)
      fetchTroveData(providerr)
    } catch (error) {
      toast.error(error);
      setNextButton(false)
      console.log("Adjust trove error",error)
    }
  };

  const handleAdjustPop = () => setAdjustPop(!adjustPop);

  const handleSupplyAmountChange = (e) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value)) {
      setSupplyAmount(value);
    } else {
      setError("Please enter a valid positive number (including decimals).");
    }
  };

  const handleDebtAmountChange = (e) => {
    const value = e.target.value;
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value)) {
      setDebtAmount(value);
      if (value !== "" && parseFloat(value) <= debtvalue) {
        setDebtError("Debt amount must be greater than the actual debt.");
      } else {
        setError("");
      }
    } else {
      setDebtError(
        "Please enter a valid positive number (including decimals)."
      );
    }
  };

  const calculateCollateralAndHealthFactor = async (collateralAmount, debt) => {
    try {
      setError("");
      // if (!providerr) {
      //   setCollRatio(0)
      //   return;
      // }

      // Fetch ETH price
      const contractAddress = process.env.NEXT_PUBLIC_ETH_PRICE_CONTRACT_ADDRESS;
      const web3 = new Web3Interaction("sepolia", providerr);
      const receipt = await web3.fetchPrice(contractAddress);
      const receiptInEther = ethers.utils.formatEther(receipt);
      const ethPrice = parseFloat(receiptInEther) * Math.pow(10, 10); // ETH price in USD

      // Convert collateralAmount and debt from string to number
      const collateral = parseFloat(collateralAmount);
      const debtAmount = parseFloat(debt);
      if (isNaN(collateral) || isNaN(debtAmount) || debtAmount === 0) {
        setError("Invalid collateral amount or debt provided.");
        return;
      }

      // Calculate collateral value and health factor
      const collateralValue = ethPrice * collateral; // Collateral value in USD
      const collateralRatio = (collateralValue * 100) / debtAmount; // Health factor calculation
      setCollRatio(collateralRatio);
      if (collateralRatio < 110) {
        setError("Collateral ratio must be at least 110%.");
      }
      if (debt < debtvalue - 200) {
        setError(
          `Total debt must be at least ${Number(debtvalue - 200).toFixed(
            2
          )} thUSD.`
        );
      }
    } catch (error) {
      return { collateralValue: "0.00", healthFactor: "0.00" };
    }
  };

  useEffect(() => {
    if (supplyAmount || debtAmount) {
      borrowingFee();
    }
  }, [supplyAmount, debtAmount]);

    useEffect(() => {
      const connectWallet = async () => {
        if (userAuth?.passkeyCred) {
          let account = await getAccount(userAuth?.passkeyCred);
          console.log("account---<", account);
          if (account) {
            let provider = await getProvider(account.kernelClient);
            console.log("provider-->", provider);
            if (provider) {
              console.log("provider -line-114", provider);
              setProviderr(provider?.ethersProvider);
            }
          }
        } 
        // else {
        //   toast.error("Please Login");
        //   return;
        // }
      };
  
      connectWallet();
      calculateCollateralAndHealthFactor(supplyAmount, debtvalue);
    }, []);
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <button
          onClick={handleAdjustPop}
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
              <h5 className="m-0 text-xl fw-bold">Adjust</h5>
            </div>
            <div className="modalBody">
              <form action="">
                <div className="py-2">
                  <label
                    htmlFor=""
                    className="form-label m-0 text-xs text-gray-400 pb-1 font-medium"
                  >
                    Supply
                  </label>
                  <input
                    type="text"
                    value={supplyAmount}
                    onChange={(e) => {
                      handleSupplyAmountChange(e);
                      setChangeInput(true);
                    }}
                    className="form-control bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)] border-gray-600 text-xs font-medium"
                  />
                </div>

                <div className="py-2">
                  <label
                    htmlFor=""
                    className="form-label m-0 text-xs text-gray-400 pb-1 font-medium"
                  >
                    Debt
                  </label>
                  <input
                    type="text"
                    value={debtAmount}
                    onChange={(e) => {
                      handleDebtAmountChange(e);
                      setChangeInput(true);
                    }}
                    className="form-control bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)]  border-gray-600 text-xs font-medium"
                  />
                  {/* {debtError && (
                    <div className="text-red-500 text-xs mt-1">{debtError}</div>
                  )} */}
                </div>
                <div className="py-3">
                  <ul className="list-none pl-0 mb-0 grid gap-3 grid-cols-12">
                    <li className="py-2 my-1 col-span-6">
                      <p className="m-0 text-base font-bold themeClr">
                        Liquidation Reserve
                      </p>
                      <p className="m-0 font-medium text-xl">200 thUSD</p>
                    </li>
                    <li className="py-2 my-1 col-span-6">
                      <p className="m-0 text-base font-bold themeClr">
                        Borrowing Fee
                      </p>
                      <p className="m-0 font-medium text-xl">
                        {Number(borrowingFeee).toFixed(2)}
                      </p>
                    </li>
                    <li className="py-2 my-1 col-span-6">
                      <p className="m-0 text-base font-bold themeClr">
                        Collateral Ratio
                      </p>
                      <p className="m-0 font-medium text-xl">
                        {collRatio ? Number(collRatio).toFixed(2) : 0}
                      </p>
                    </li>
                    <li className="py-2 my-1 col-span-6">
                      <p className="m-0 text-base font-bold themeClr">
                        Total Debt
                      </p>
                      <p className="m-0 font-medium text-xl">
                        {Number(totalDebtAmount).toFixed(2)}
                      </p>
                    </li>
                  </ul>
                </div>

                {error && (
                  <div className="text-red-500 text-xs mt-1">{error}</div>
                )}
                <div className="btnWrpper mt-3">
                  <button
                    type="button"
                    className="flex items-center justify-center btn commonBtn w-full"
                    // disabled={supplyAmount === 0 ? true : false}
                    disabled={
                      collRatio > 110 && error === "" && changeInput === true && nextButton === false
                        ? false
                        : true
                    }
                    // disabled={supplyAmount !== supply && debtAmount !== debtvalue && collRatio > 110 && error === ''  ? false : true}
                    onClick={() => addSupply()}
                  >
                    {nextButton ? "Adjusting Trove ...":"Next"}
                  </button>
                </div>
              </form>
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
    max-width: 700px !important;
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

export default AdjustPopup;

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
