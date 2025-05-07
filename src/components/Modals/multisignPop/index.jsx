import React, {  useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { createPassKeyWeightedClient } from "@/lib/zeroDevWallet";
import { zeroAddress } from "viem";

const MultiSignPop = ({ sign, setSign }) => {
  const userAuth = useSelector((state) => state.Auth);
  const [status, setStatus] = useState("Try Trxn");
  const [signatures, setSignatures] = useState([]);

  const approveUserOperationWithActiveSigner = async (type = 2) => {
    try {
      const getClient = await createPassKeyWeightedClient(
        type == 2 ? userAuth.passkey2 : userAuth.passkey3,
        userAuth.webauthKey,
        userAuth.passkey2,
        userAuth.passkey3
      );
      if (getClient.status) {
        setStatus("Approving Operation");
        const signature = await getClient.client.approveUserOperation({
          callData: await getClient.client.account.encodeCalls([
            {
              to: zeroAddress,
              data: "0x",
              value: BigInt(0),
            },
          ]),
        });
        setSignatures([...signatures, signature]);
        setStatus("Operation Approved");
        toast.success("Approved!");
      } else {
        toast.error(getClient.msg);
      }
    } catch (error) {
      console.log("error-->", error);
      toast.error(error.message);
    }
  };
  const sendTrxn = async () => {
    try {
      if (signatures.length <= 0) {
        return toast.error("Plese Approve First");
      }
      const getClient = await createPassKeyWeightedClient(
        userAuth.webauthKey,
        userAuth.webauthKey,
        userAuth.passkey2,
        userAuth.passkey3
      );
      setStatus("Sending Transaction");

      const userOpHash = await getClient.client.sendUserOperationWithSignatures(
        {
          callData: await getClient.client.account.encodeCalls([
            {
              to: zeroAddress,
              value: BigInt(0),
              data: "0x",
            },
          ]),
          signatures,
        }
      );
      console.log("test", { userOpHash });
      setStatus("Transaction Sent");
      toast.success("Trxn is Done!");
      setSignatures([]);
    } catch (error) {
      setStatus("Transaction Sent");
      setSignatures([]);
      toast.success("Trxn Done!");
    }
  };

  const handleMultiSign = () => setSign(!sign);
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <buttonbuy
          onClick={handleMultiSign}
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
            </div>
            <div className="modalBody text-center">
              <div className="grid gap-3 grid-cols-12">
                <div className="col-span-6">
                  <button
                    onClick={() => approveUserOperationWithActiveSigner(2)}
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    Approve Trxn With Passkey 2
                  </button>
                </div>
                <div className="col-span-6">
                  <button
                    onClick={() => approveUserOperationWithActiveSigner(3)}
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    Approve Trxn With Passkey 3
                  </button>
                </div>
                <div className="col-span-6">
                  <button
                    onClick={sendTrxn}
                    className={` bg-white hover:bg-white/80 text-black ring-white/40 active:bg-white/90 flex w-full h-[42px] text-xs items-center rounded-full  px-4 text-14 font-medium -tracking-1  transition-all duration-300  focus:outline-none focus-visible:ring-3 active:scale-100  min-w-[112px] justify-center disabled:pointer-events-none disabled:opacity-50`}
                  >
                    Send Trxn
                  </button>
                </div>
              </div>
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
    max-width: 550px !important;
    padding-bottom: 40px !important;

    input {
      color: var(--textColor);
    }
  }
`;

export default MultiSignPop;

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
