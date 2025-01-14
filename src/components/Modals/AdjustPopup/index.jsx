import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";

// css

// img

const AdjustPopup = ({ adjustPop, setAdjustPop, supply, debtvalue }) => {

  const [supplyAmount, setSupplyAmount] = useState(supply);
  const [totalDebtAmount, settotalDebtAmount] = useState();
  const [borrowingFeee, setBorrowingFeee] = useState();
  const [debtAmount, setDebtAmount] = useState(debtvalue - 200);
  const [error, setError] = useState("");
  const [debtError, setDebtError] = useState("");
  const [collRatio, setCollRatio] = useState();

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
  
    console.log("Debt Amount:", debtAmountNum);
    console.log("Net Debt:", netDebt);
    console.log("Difference Amount:", differenceAmount);
    console.log("Borrowing Amount:", borrowingAmount);
  
    // Update states
    setBorrowingFeee(borrowingAmount);
    const totalDebt = debtAmountNum + 200 + borrowingAmount;
    settotalDebtAmount(parseFloat(totalDebt));
  
    console.log("Total Debt Amount:", totalDebt);
  };
  
  

  const addSupply = async () => {
    const provider = window.ethereum; // Ensure user has a wallet extension
    if (!provider) {
      return toast.error("Please Connect to wallet");
    }

    const web3 = new Web3Interaction("sepolia", provider);

    const contractAddress = "0xe2eA5880effFdd234A065dBBC174D6cb8a867167";
    const lowerHint = "0x9A872029Ee44858EA17B79E30198947907a3a67A";
    const maxFeePercentage = ethers.utils.parseEther("0.01");

    let updatedSupplyAmount = supplyAmount;
    let updatedDebtAmount = debtAmount;
    // updatedSupplyAmount = supplyAmount - supply;
    // updatedDebtAmount = debtAmount - (debtvalue - 200);
    updatedSupplyAmount = Math.abs(supplyAmount - supply);
    updatedDebtAmount = Math.abs(debtAmount - (debtvalue - 200));
    const callWithFalse = debtAmount > debtvalue - 200 ? true : false;

    let upperHint =
      callWithFalse === true
        ? "0x7C2277b9054B6Fa32790Eb1B6Eb2a43F62e27F8e"
        : "0x9A872029Ee44858EA17B79E30198947907a3a67A";

    // Determine the condition and adjust amounts
    // const callWithFalse = supplyAmount > supply && debtAmount === debtvalue;
    console.log("line-43", callWithFalse);

    // if (callWithFalse) {
    //   console.log("inside if", supplyAmount, supply);
    //   updatedSupplyAmount = supplyAmount - supply;
    //   updatedDebtAmount = 0;
    //   upperHint = "0x9A872029Ee44858EA17B79E30198947907a3a67A";
    // } else {
    //   console.log("inside else", debtAmount, debtvalue);
    //   updatedSupplyAmount = 0;
    //   updatedDebtAmount = debtAmount - debtvalue;
    //   upperHint = "0x7C2277b9054B6Fa32790Eb1B6Eb2a43F62e27F8e";
    // }

    const supplyAmountInWei = ethers.utils.parseEther(
      updatedSupplyAmount.toString()
    );
    const debtAmountInWei = ethers.utils.parseEther(
      updatedDebtAmount.toString()
    );
    console.log("line-55", updatedSupplyAmount, updatedDebtAmount);
    try {
      await web3.adjustTrove(
        contractAddress,
        maxFeePercentage,
        supplyAmountInWei,
        debtAmountInWei,
        callWithFalse,
        "0",
        upperHint,
        lowerHint
      );
      toast.success(`Contract called successfully`);
    } catch (error) {
      console.error("Error calling adjustTrove:", error);
      toast.error("Error calling contract");
    }
  };

  const handleAdjustPop = () => setAdjustPop(!adjustPop);

  const handleSupplyAmountChange = (e) => {
    const value = e.target.value;
    console.log("line-86", value);

    // Regex to match positive numbers and decimals
    const regex = /^\d*\.?\d*$/; // Allows decimals and empty values

    // Allow the input to be empty or a valid positive number (decimal or integer)
    if (regex.test(value)) {
      console.log("line-92", value);

      // Only update supplyAmount if value is valid (or empty for resetting)
      setSupplyAmount(value);

      // Check if supplyAmount is greater than the props supply
      // if (value !== "" && parseFloat(value) <= supply) {
      //   setError("Supply amount must be greater than the actual supply.");
      // } else {
      //   setError(""); // Clear error if supplyAmount is valid
      // }
    } else {
      setError("Please enter a valid positive number (including decimals).");
    }
  };

  const handleDebtAmountChange = (e) => {
    const value = e.target.value;
    console.log("line-86", value);

    // Regex to match positive numbers and decimals
    const regex = /^\d*\.?\d*$/; // Allows decimals and empty values

    // Allow the input to be empty or a valid positive number (decimal or integer)
    if (regex.test(value)) {
      console.log("line-92", value);

      // Only update supplyAmount if value is valid (or empty for resetting)
      setDebtAmount(value);

      // Check if supplyAmount is greater than the props supply
      if (value !== "" && parseFloat(value) <= debtvalue) {
        setDebtError("Debt amount must be greater than the actual debt.");
      } else {
        setError(""); // Clear error if supplyAmount is valid
      }
    } else {
      setDebtError(
        "Please enter a valid positive number (including decimals)."
      );
    }
  };

  const calculateCollateralAndHealthFactor = async (collateralAmount, debt) => {
    try {
      setError('')
      const provider = window.ethereum; // Ensure user has a wallet extension
      if (!provider) {
        return { collateralValue: "0.00", healthFactor: "0.00" };
      }

      // Fetch ETH price
      const contractAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
      const web3 = new Web3Interaction("sepolia", provider);
      const receipt = await web3.fetchPrice(contractAddress);
      const receiptInEther = ethers.utils.formatEther(receipt);
      const ethPrice = parseFloat(receiptInEther) * Math.pow(10, 10); // ETH price in USD

      // Convert collateralAmount and debt from string to number
      const collateral = parseFloat(collateralAmount);
      const debtAmount = parseFloat(debt);

      if (isNaN(collateral) || isNaN(debtAmount) || debtAmount === 0) {
        setError("Invalid collateral amount or debt provided.");
        return
      }

      // Calculate collateral value and health factor
      const collateralValue = ethPrice * collateral; // Collateral value in USD
      const collateralRatio = (collateralValue * 100) / debtAmount; // Health factor calculation
      console.log("line-169", collateralRatio,debt);
      setCollRatio(collateralRatio)
      if(collateralRatio < 110){
        setError("Collateral ratio must be at least 110%.")
      }if(debt < (debtvalue - 200)){
        setError(`Total debt must be at least ${Number((debtvalue - 200)).toFixed(2)} thUSD.`)
      }
    } catch (error) {
      return { collateralValue: "0.00", healthFactor: "0.00" };
    }
  };

  useEffect(() => {
    if(supplyAmount || debtAmount){
      borrowingFee()
      calculateCollateralAndHealthFactor(supplyAmount, debtAmount);

      
    }
  }, [supplyAmount,debtAmount]);

  useEffect(() => {
 calculateCollateralAndHealthFactor(supplyAmount,debtvalue);
  },[])
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
              onClick={handleAdjustPop}
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
              <h5 className="m-0 text-xl fw-bold">Adjust</h5>
            </div>
            <div className="modalBody">
              <form action="">
                {/* <div className="py-2">
                  <label
                    htmlFor=""
                    className="form-label m-0 text-xs text-gray-400 pb-1 font-medium"
                  >
                    Supply
                  </label>
                  <input
                    type="text"
                    value={supplyAmount}
                    // onChange={(e) => setBorrowingAmount(Number(e.target.value))}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log("Updated Supply Amount:", value);
                      // if (/^\d*$/.test(value)) {
                        setSupplyAmount(Number(value)); // Update the state only if valid
                      // }
                    }}
                    className="form-control bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)]  border-gray-600 text-xs font-medium"
                  />
                </div> */}

                {/* <div className="py-2">
                  <label
                    htmlFor=""
                    className="form-label m-0 text-xs text-gray-400 pb-1 font-medium"
                  >
                    Debt
                  </label>
                  <input
                    type="text"
                    value={debtAmount}
                    // onChange={(e) => setBorrowingAmount(Number(e.target.value))}
                    onChange={(e) => {
                      const value = e.target.value;
                      // if (/^\d*$/.test(value)) {
                      setDebtAmount(Number(value)); // Update the state only if valid
                      // }
                    }}
                    className="form-control bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)]  border-gray-600 text-xs font-medium"
                  /> */}

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
                    onChange={handleSupplyAmountChange}
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
                    onChange={handleDebtAmountChange}
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
                      <p className="m-0 font-medium text-xl">{Number(borrowingFeee).toFixed(2)}</p>
                    </li>
                    <li className="py-2 my-1 col-span-6">
                      <p className="m-0 text-base font-bold themeClr">
                        Collateral Ratio
                      </p>
                      <p className="m-0 font-medium text-xl">{Number(collRatio).toFixed(2)}</p>
                    </li>
                    <li className="py-2 my-1 col-span-6">
                      <p className="m-0 text-base font-bold themeClr">
                        Total Debt
                      </p>
                      <p className="m-0 font-medium text-xl">{Number(totalDebtAmount).toFixed(2)}</p>
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
                    disabled={collRatio > 110 && error === ''  ? false : true}
                    // disabled={supplyAmount !== supply && debtAmount !== debtvalue && collRatio > 110 && error === ''  ? false : true}
                    onClick={() => addSupply()}
                  >
                    Next
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

export default AdjustPopup;
