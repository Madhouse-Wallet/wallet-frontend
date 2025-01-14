import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Web3Interaction from "@/utils/web3Interaction";
import { ethers } from "ethers";
import { toast } from "react-toastify";

// css

// img

const SupplyPopUp = ({ supplyPop, setSupplyPop }) => {
  const calculateCollateralAmount = (baseAmount) => {
    if (!baseAmount) return 0;
    const fixedValue = 200;
    const percentage = 0.005; // 0.5% in decimal

    const collateralAmount = baseAmount + fixedValue + baseAmount * percentage;
    return collateralAmount;
  };

  const [supplyAmount, setSupplyAmount] = useState(0);


  const addSupply = async (borrowingAmount) => {
    const provider = window.ethereum; // Ensure user has a wallet extension
    if (!provider) {
      return toast.error("Please Coonect to wallet");
    }

    const web3 = new Web3Interaction("sepolia", provider);

    const contractAddress = "0xe2eA5880effFdd234A065dBBC174D6cb8a867167";
    const upperHint = "0x8f4A19C85b39032A37f7a6dCc65234f966F72551";
    const lowerHint = "0x8f4A19C85b39032A37f7a6dCc65234f966F72551";
    const amount = ethers.utils.parseEther(
      supplyAmount.toString()
    );

    try {
      await web3.addColl(
        contractAddress,
        "0",
        upperHint,
        lowerHint,
        amount
      );
    } catch (error) {
      console.error("Error calling openTrove:", error);
    }
  };

  const handleSupplyPosition = () => setSupplyPop(!supplyPop);

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
              onClick={handleSupplyPosition}
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
                      if (/^\d*$/.test(value)) {
                        setSupplyAmount(Number(value)); // Update the state only if valid
                      }
                    }}
                    className="form-control bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)]  border-gray-600 text-xs font-medium"
                  />
                </div>
                <div className="btnWrpper mt-3">
                  <button
                    type="button"
                    className="flex items-center justify-center btn commonBtn w-full"
                    disabled={supplyAmount === 0 ? true : false}
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

export default SupplyPopUp;
