import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getAccount,getProvider } from "@/lib/zeroDevWallet";

// css

// img

const SupplyPopUp = ({ supplyPop, setSupplyPop, fetchTroveData }) => {
  const userAuth = useSelector((state) => state.Auth);
  const [providerr, setProviderr] = useState(null);

  const calculateCollateralAmount = (baseAmount) => {
    if (!baseAmount) return 0;
    const fixedValue = 200;
    const percentage = 0.005; // 0.5% in decimal

    const collateralAmount = baseAmount + fixedValue + baseAmount * percentage;
    return collateralAmount;
  };

  const [supplyAmount, setSupplyAmount] = useState(0);
  const [nextButton, setNextButton] = useState(false);

  const addSupply = async () => {
    if (!providerr) {
      return toast.error("Please Coonect to wallet");
    }
    setNextButton(true);
    const web3 = new Web3Interaction("sepolia", providerr);

    const contractAddress =
      process.env.NEXT_PUBLIC_THRESHOLD_WITHDRWAL_CONTRACT_ADDRESS;
    const upperHint =
      process.env.NEXT_PUBLIC_THRESHOLD_UPPERHINT_CONTRACT_ADDRESS;
    const lowerHint =
      process.env.NEXT_PUBLIC_THRESHOLD_LOWERHINT_CONTRACT_ADDRESS;
    const amount = ethers.utils.parseEther(supplyAmount.toString());

    try {
      let account = await getAccount(userAuth?.passkeyCred);
      await web3.addColl(contractAddress, "0", upperHint, lowerHint, amount,account?.kernelClient);
      toast.success("Supply Added Successfully");
      setSupplyPop(false);
      fetchTroveData(providerr);
    } catch (error) {
      setNextButton(false);
      toast.error(error);
      console.log("Add supply",error)
    }
  };

  const handleSupplyPosition = () => setSupplyPop(!supplyPop);

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
      } else {
        toast.error("Please Login");
        return;
      }
    };

    connectWallet();
  }, []);

  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <button
          onClick={handleSupplyPosition}
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
              <h5 className="m-0 text-xl fw-bold">Add Supply</h5>
            </div>
            <div className="modalBody">
              <form action="">
                <div className="py-2">
                  <label
                    htmlFor=""
                    className="form-label m-0 text-xs text-gray-400 pb-1 font-medium"
                  >
                    Supply Amount (BTC)
                  </label>
                  <input
                    type="text"
                    value={supplyAmount}
                    // onChange={(e) => setBorrowingAmount(Number(e.target.value))}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        setSupplyAmount(value); // Update the state only if valid
                      }
                    }}
                    className="form-control bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)]  border-gray-600 text-xs font-medium"
                  />
                </div>
                <div className="btnWrpper mt-3">
                  <button
                    type="button"
                    className="flex items-center justify-center btn commonBtn w-full"
                    disabled={
                      supplyAmount === "0" || supplyAmount === 0 || nextButton
                        ? true
                        : false
                    }
                    onClick={() => addSupply()}
                  >
                    {nextButton ? "Adding Supply..." : "Next"}
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

export default SupplyPopUp;

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
