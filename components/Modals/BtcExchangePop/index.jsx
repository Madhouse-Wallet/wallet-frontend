import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import styled from "styled-components";

// css

// img

const BtcExchangePop = ({ btcExchange, setBtcExchange }) => {
  const handleBTCExchange = () => setBtcExchange(!btcExchange);

  return (
    <>
      <Modal
        show={btcExchange}
        className={`  BtcExchangePop`}
        onHide={handleBTCExchange}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Body className={`position-relative rounded`}>
          <Button
            onClick={handleBTCExchange}
            className="border-0 p-0 position-absolute"
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
          </Button>
          <div className="top pb-3">
            <h5 className="m-0 fw-bold">Receive Bitcoin</h5>
            <p className="m-0" style={{ fontSize: 12 }}>
              Generate a QR code or wallet address to receive Bitcoin Securely
            </p>
          </div>
          <div className="content p-3">
            <div className="cardCstm p-3 text-center">
              {qrCode}
              <div className="content mt-2" style={{ fontSize: 12 }}>
                <h6 className="m-0 themeClr">Your Wallet Address</h6>
                <p className="m-0">bceadf23423423sdfsdfsdf32434</p>
              </div>
            </div>
            <div className="btnWrpper mt-3">
              <RadioList className="list-unstyled ps-0 mb-0 d-flex align-items-center justify-content-center gap-10">
                <li className="position-relative">
                  <input
                    type="radio"
                    name="wallet"
                    className="position-absolute h-100 cursor-pointer w-100 opacity-0"
                  />
                  <Button className="d-flex align-items-center justify-content-center fw-sbold">
                    Native Segwit
                  </Button>
                </li>
                <li className="position-relative">
                  <input
                    type="radio"
                    name="wallet"
                    className="position-absolute h-100 cursor-pointer w-100 opacity-0"
                  />
                  <Button className="d-flex align-items-center justify-content-center fw-sbold">
                    Lightning Network
                  </Button>
                </li>
                <li className="position-relative">
                  <input
                    type="radio"
                    name="wallet"
                    className="position-absolute h-100 cursor-pointer w-100 opacity-0"
                  />
                  <Button className="d-flex align-items-center justify-content-center fw-sbold">
                    Liquid Network
                  </Button>
                </li>
              </RadioList>
            </div>
          </div>
          <div className="btnWRpper mt-4">
            <Button className="d-flex align-items-center justify-content-center commonBtn w-100">
              Generate QR Codes and Address
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

const RadioList = styled.ul`
  button {
    font-size: 12px;
    background: var(--cardBg);
    border-color: var(--cardBg);
  }
  input:checked + button {
    background: #76fc93;
    border-color: #76fc93;
    color: #000;
  }
`;
export default BtcExchangePop;

const qrCode = (
  <svg
    width="100"
    height="100"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13 14H14V15H13V14ZM14 15H15V16H14V15ZM14 16H15V17H14V16ZM16 16H17V17H16V16ZM16 17H17V18H16V17ZM13 16H14V17H13V16ZM15 16H16V17H15V16ZM15 17H16V18H15V17ZM18 16H19V17H18V16ZM18 15H19V16H18V15ZM19 14H20V15H19V14ZM17 16H18V17H17V16ZM17 17H18V18H17V17ZM16 18H17V19H16V18ZM15 18H16V19H15V18ZM17 18H18V19H17V18ZM18 18H19V19H18V18ZM16 19H17V20H16V19ZM14 19H15V20H14V19ZM15 19H16V20H15V19ZM13 19H14V20H13V19ZM13 20H14V21H13V20ZM14 21H15V22H14V21ZM15 21H16V22H15V21ZM17 21H18V22H17V21ZM18 21H19V22H18V21ZM17 19H18V20H17V19ZM18 19H19V20H18V19ZM19 18H20V19H19V18ZM19 17H20V18H19V17ZM19 20H20V21H19V20ZM19 19H20V20H19V19ZM20 18H21V19H20V18ZM20 17H21V18H20V17ZM21 20H22V21H21V20ZM21 18H22V19H21V18ZM21 19H22V20H21V19ZM19 16H20V17H19V16ZM13 17H14V18H13V17ZM12 17H13V18H12V17ZM12 18H13V19H12V18ZM14 18H15V19H14V18ZM11 18H12V19H11V18ZM13 18H14V19H13V18ZM11 19H12V20H11V19ZM11 20H12V21H11V20ZM11 1H12V2H11V1ZM12 2H13V3H12V2ZM11 4H12V5H11V4ZM12 5H13V6H12V5ZM11 6H12V7H11V6ZM12 6H13V7H12V6ZM12 7H13V8H12V7ZM12 8H13V9H12V8ZM11 9H12V10H11V9ZM12 9H13V10H12V9ZM11 10H12V11H11V10ZM1 11H2V12H1V11ZM2 12H3V13H2V12ZM4 11H5V12H4V11ZM4 12H5V13H4V12ZM5 11H6V12H5V11ZM6 12H7V13H6V12ZM7 11H8V12H7V11ZM8 12H9V13H8V12ZM8 11H9V12H8V11ZM9 11H10V12H9V11ZM10 11H11V12H10V11ZM11 12H12V13H11V12ZM13 12H14V13H13V12ZM14 11H15V12H14V11ZM15 11H16V12H15V11ZM16 11H17V12H16V11ZM15 13H16V14H15V13ZM13 22H14V23H13V22ZM12 22H13V23H12V22ZM12 13H13V14H12V13ZM11 13H12V14H11V13ZM11 14H12V15H11V14ZM11 15H12V16H11V15ZM22 14H23V15H22V14ZM21 15H22V16H21V15ZM22 17H23V18H22V17ZM17 13H18V14H17V13ZM18 12H19V13H18V12ZM22 12H23V13H22V12ZM22 13H23V14H22V13ZM21 13H22V14H21V13ZM22 21H23V22H22V21ZM21 22H22V23H21V22ZM19 22H20V23H19V22ZM22 22H23V23H22V22Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M15 2H22V9H15V2ZM2 2H9V9H2V2ZM2 15H9V22H2V15ZM18 5H19V6H18V5ZM5 5H6V6H5V5ZM5 18H6V19H5V18Z"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>
);
