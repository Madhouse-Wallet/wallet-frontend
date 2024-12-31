import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

// css

// img

const BTCAddressPop = ({ btcAddress, setBtcAddress }) => {
  const handleAddressPop = () => setBtcAddress(!btcAddress);

  return (
    <>
      <Modal
        show={btcAddress}
        className={`  BTCAddressPop`}
        onHide={handleAddressPop}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Body className={`position-relative rounded`}>
          <Button
            onClick={handleAddressPop}
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
            <h5 className="m-0 fw-bold">BTC {`==>`} Base Bridge & Borrow</h5>
          </div>
          <ul className="list-unstyled ps-0 mb-0">
            <li
              className="py-1 d-flex align-items-center justify-content-between"
              style={{ borderBottom: "1px dashed var(--cardBg2)" }}
            >
              <p className="m-0">Bridge:</p>
              <p className="m-0 fw-sbold">Threshold Network</p>
            </li>
            <li
              className="py-1 d-flex align-items-center justify-content-between"
              style={{ borderBottom: "1px dashed var(--cardBg2)" }}
            >
              <p className="m-0">Destination:</p>
              <p className="m-0 fw-sbold">Base Network</p>
            </li>
            <li className="py-1 d-flex align-items-center justify-content-between">
              <p className="m-0">Collateralized Debt Position:</p>
              <p className="m-0 fw-sbold">tBTC{`==>`}USDC</p>
            </li>
          </ul>
          <Form className="p-3">
            <Row>
              <Col lg="12" className="my-2">
                <p className="m-0">BTC Return Address</p>
                <input
                  type="text"
                  placeholder="BTC address should start with 'I' or 'bc1'"
                  className="form-control"
                />
              </Col>
              <Col lg="12" className="my-2">
                <div className="d-flex align-items-center gap-10">
                  <input type="checkbox" className="form-check" />
                  <p className="m-0">Download Deposit Recipt (recommended)</p>
                </div>
              </Col>
              <Col lg="12" className="my-2">
                <Button className="d-flex align-items-center justify-content-center commonBtn w-100">
                  Generate Deposit Address
                </Button>
                <Button
                  className="border-0 themeClr p-0 w-100 mt-4"
                  variant="transparent"
                >
                  Bridge Contract
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BTCAddressPop;
