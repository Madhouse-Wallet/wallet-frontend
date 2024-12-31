import React, { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import Image from "next/image";
import p1 from "@/public/user.png";

// css

// img

const BuyCoveragePop = ({ buycoverage, setBuyCoverage }) => {
  const router = useRouter();
  const handleBuyCoverage = () => setBuyCoverage(!buycoverage);

  return (
    <>
      <Modal
        show={buycoverage}
        className={`BuyCoveragePop`}
        onHide={handleBuyCoverage}
        backdrop="static"
        keyboard={false}
        centered
        scrollable="true"
      >
        <Modal.Body className={`position-relative rounded`}>
          <Button
            onClick={handleBuyCoverage}
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
            <h5 className="m-0 fw-bold">Coverage Purchased</h5>
          </div>
          <div className="content p-3">
            <div className="py-2">
              <ul className="list-unstyled ps-0 mb-0">
                <li
                  className="py-2"
                  style={{ borderBottom: "1px dashed #ddd" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-between flex-wrap gap-10"
                    style={{ fontSize: 12 }}
                  >
                    <div className="left d-flex align-items-center gap-10">
                      <div className="imgWrp flex-shrink-0">
                        <Image
                          src="https://www.shutterstock.com/image-photo/banner-gold-bitcoin-on-isolated-260nw-770056429.jpg"
                          height={10000}
                          width={10000}
                          alt=""
                          style={{ height: 70, width: 100 }}
                          className="img-fluid object-fit-cover rounded"
                        />
                      </div>
                      <div className="content">
                        <p className="m-0 fw-sbold">Expiry Date</p>
                        <p className="m-0 fw-sbold">Jun 22 2025</p>
                      </div>
                    </div>
                    <div className="right">
                      <p
                        className={`greenStatus status d-inline-flex m-0 rounded-pill px-2 text-capitalize py-1 fw-sbold`}
                      >
                        ID: 232
                      </p>
                      <p className="m-0 mt-2 ">
                        Amount: <span className="themeClr">$100</span>{" "}
                      </p>
                    </div>
                  </div>
                </li>
                <li
                  className="py-2"
                  style={{ borderBottom: "1px dashed #ddd" }}
                >
                  <div
                    className="d-flex align-items-center justify-content-between flex-wrap gap-10"
                    style={{ fontSize: 12 }}
                  >
                    <div className="left d-flex align-items-center gap-10">
                      <div className="imgWrp flex-shrink-0">
                        <Image
                          src="https://www.shutterstock.com/image-photo/banner-gold-bitcoin-on-isolated-260nw-770056429.jpg"
                          height={10000}
                          width={10000}
                          alt=""
                          style={{ height: 70, width: 100 }}
                          className="img-fluid object-fit-cover rounded"
                        />
                      </div>
                      <div className="content">
                        <p className="m-0 fw-sbold">Expiry Date</p>
                        <p className="m-0 fw-sbold">Jun 22 2025</p>
                      </div>
                    </div>
                    <div className="right">
                      <p
                        className={`greenStatus status d-inline-flex m-0 rounded-pill px-2 text-capitalize py-1 fw-sbold`}
                      >
                        ID: 232
                      </p>
                      <p className="m-0 mt-2 ">
                        Amount: <span className="themeClr">$100</span>{" "}
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="py-2">
              <ul className="list-unstyled ps-0 mb-0" style={{ fontSize: 12 }}>
                <li className="py-1 d-flex align-items-center justify-content-between">
                  <span className="">Principal to Cover</span>
                  <span className="themeClr">$20000</span>
                </li>
                <li className="py-1 d-flex align-items-center justify-content-between">
                  <span className="">Expiry Date</span>
                  <span className="themeClr">Aug 14 2025</span>
                </li>
                <li
                  className="py-1 mt-2 d-flex align-items-center justify-content-between"
                  style={{ borderTop: "1px dashed #ddd" }}
                >
                  <span className="fw-bold">Total</span>
                  <span className="themeClr fw-bold">$50.41</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="btnWRpper mt-4">
            <Button className="d-flex align-items-center justify-content-center commonBtn w-100 fw-sbold">
              Buy Coverage
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BuyCoveragePop;

const BTC = (
  <svg
    width="30"
    height="30"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_13_2)">
      <path
        d="M15.7607 9.93462C14.6918 14.2226 10.3474 16.8292 6.06549 15.7603C1.77737 14.6914 -0.829259 10.3472 0.239679 6.06537C1.30855 1.77737 5.64668 -0.829258 9.9348 0.239679C14.2167 1.3023 16.8296 5.64655 15.7607 9.93462Z"
        fill="url(#paint0_linear_13_2)"
      />
      <path
        d="M11.8091 7.00312C11.9653 5.94062 11.1591 5.36562 10.0466 4.98437L10.4091 3.54062L9.53407 3.32187L9.18407 4.72812C8.95282 4.67187 8.71532 4.61562 8.47782 4.56562L8.82782 3.15312L7.95282 2.93437L7.59657 4.37187C7.40282 4.32812 7.21532 4.28437 7.03407 4.24062V4.23437L5.82157 3.93437L5.59032 4.87187C5.59032 4.87187 6.24032 5.02187 6.22782 5.02812C6.58407 5.11562 6.64657 5.35312 6.63407 5.54062L6.22157 7.18437C6.24657 7.19062 6.27782 7.19687 6.31532 7.21562C6.28407 7.20937 6.25282 7.20312 6.22157 7.19062L5.64657 9.49062C5.60282 9.59687 5.49032 9.75937 5.24657 9.69687C5.25282 9.70937 4.60907 9.54062 4.60907 9.54062L4.17157 10.5469L5.31532 10.8344C5.52782 10.8906 5.73407 10.9406 5.94032 10.9969L5.57782 12.4531L6.45282 12.6719L6.81532 11.2281C7.05282 11.2906 7.29032 11.3531 7.51532 11.4094L7.15907 12.8469L8.03407 13.0656L8.39657 11.6094C9.89657 11.8906 11.0216 11.7781 11.4903 10.4219C11.8716 9.33437 11.4716 8.70312 10.6841 8.29062C11.2653 8.15937 11.6966 7.77812 11.8091 7.00312ZM9.80282 9.81562C9.53407 10.9031 7.69657 10.3156 7.10282 10.1656L7.58407 8.23437C8.17782 8.38437 10.0903 8.67812 9.80282 9.81562ZM10.0778 6.98437C9.82782 7.97812 8.30282 7.47187 7.80907 7.34687L8.24657 5.59687C8.74032 5.72187 10.3341 5.95312 10.0778 6.98437Z"
        fill="white"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_13_2"
        x1="799.567"
        y1="-0.384"
        x2="799.567"
        y2="1599.84"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#F9AA4B" />
        <stop offset="1" stop-color="#F7931A" />
      </linearGradient>
      <clipPath id="clip0_13_2">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
