"use client";
import { ThemeProvider } from "@/components/ContextApi/ThemeContext";
import Switch from "react-switch";
import Header from "@/components/Header";
import Loader from "@/components/loader";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Nav, Row, Tab } from "react-bootstrap";
import p1 from "@/public/user.png";
import Image from "next/image";
import styled from "styled-components";
import { MinimizeTwoTone } from "@mui/icons-material";

const DebtPosition: React.FC = () => {
  const router = useRouter();
  const [showFirstComponent, setShowFirstComponent] = useState(true);
  const [ischecked, setIschecked] = useState();
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstComponent(false); // Hide the first component after 4-5 seconds
    }, 3000); // 5000ms = 5 seconds

    // Cleanup timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };
  return (
    <>
      <ThemeProvider>
        {true ? <Header /> : ""}
        {showFirstComponent ? (
          <Loader />
        ) : (
          <>
            <section className="position-relative dashboard py-3">
              <Container>
                <Row>
                  <Col lg="12" className="my-2">
                    <div className="sectionHeader pb-2 border-bottom border-secondary mb-4">
                      <div className="d-flex align-items-center gap-10">
                        <Button
                          onClick={handleGoBack}
                          variant="transparent"
                          className="border-0 themeClr p-0"
                        >
                          {backIcn}
                        </Button>
                        <h4 className="m-0">Collateral Debt Position</h4>
                      </div>
                    </div>
                  </Col>
                  <Col md="6" className="my-2">
                    <CardCstm
                      className="p-3 rounded position-relative"
                      style={{ maxWidth: 300 }}
                    >
                      <div className="top pb-3 d-flex align-items-center justify-content-between gap-10">
                        <div className="content">
                          <p className="m-0">Assets</p>
                        </div>
                        <span className="icn">
                          <Button
                            className="d-flex align-items-center justify-content-center commonBtn fw-sbold"
                            style={{ minWidth: "unset" }}
                          >
                            APY 4%
                          </Button>
                        </span>
                      </div>
                      <div
                        className="pt-3 p-3 rounded"
                        style={{ background: "var(--cardBg2)" }}
                      >
                        <ul
                          className="list-unstyled ps-0 mb-0"
                          style={{ fontSize: 12 }}
                        >
                          <li className=" d-flex align-items-center justify-content-between">
                            <p className="m-0 fw-sbold">Net Balance</p>
                            <p className="m-0 fw-sbold">$ 1,234,34</p>
                          </li>
                          <li
                            className=" d-flex align-items-center justify-content-between"
                            style={{ fontSize: 10 }}
                          >
                            <p className="m-0 fw-sbold">Health Factor</p>
                            <p className="m-0 fw-sbold"> 1.2</p>
                          </li>
                        </ul>
                      </div>
                    </CardCstm>
                  </Col>
                  <Col lg="12" className="my-2">
                    <Row>
                      <Col md="6" className="my-2">
                        <div className="sectionHeader pb-3">
                          <h4 className="m-0 fw-bold">Position</h4>
                        </div>
                        <div className="py-2">
                          <CardCstm
                            className="position-relative p-3 rounded d-flex align-items-center justify-content-between"
                            style={{
                              fontSize: 12,
                              background: "var(--cardBg2)",
                            }}
                          >
                            <div className="left">
                              <p className="m-0 fw-sbold">Supply</p>
                              <p className="m-0">APY 1%</p>
                            </div>
                            <div className="right">
                              <p className="m-0 fw-sbold">$10000</p>
                            </div>
                          </CardCstm>
                        </div>
                        <div className="py-2">
                          <CardCstm
                            className="position-relative p-3 rounded d-flex align-items-center justify-content-between"
                            style={{
                              fontSize: 12,
                              background: "var(--cardBg2)",
                            }}
                          >
                            <div className="left">
                              <p className="m-0 fw-sbold">Borrow</p>
                              <p className="m-0">APY 1%</p>
                            </div>
                            <div className="right">
                              <p className="m-0 fw-sbold">-$40000</p>
                            </div>
                          </CardCstm>
                        </div>
                      </Col>
                      <Col md="6" className="my-2">
                        <div className="sectionHeader pb-3">
                          <h4 className="m-0 fw-bold">Management</h4>
                        </div>
                        <div className="py-2">
                          <CardCstm
                            className="position-relative p-3 rounded d-flex align-items-center justify-content-between"
                            style={{
                              fontSize: 12,
                              background: "var(--cardBg2)",
                            }}
                          >
                            <div className="left">
                              <p className="m-0 fw-sbold">
                                Liquidation Protection
                              </p>
                            </div>
                            <div className="right">
                              <GradientHandleSwitch
                                uncheckedIcon={undefined}
                                checkedIcon={undefined}
                                height={16}
                                width={48}
                                handleDiameter={24}
                                offColor="#4C4C57"
                                onColor="#4C4C57"
                                checked={ischecked}
                                onChange={() => setIschecked(!ischecked)}
                                boxShadow="0px 0px 0px 0px"
                                activeBoxShadow="0px 0px 0px 0px"
                              />
                            </div>
                          </CardCstm>
                        </div>

                        <div className="py-2">
                          <CardCstm
                            className="position-relative p-3 rounded d-flex align-items-center justify-content-between flex-wrap"
                            style={{
                              fontSize: 12,
                              background: "var(--cardBg2)",
                            }}
                          >
                            <div className="left">
                              <p className="m-0 fw-sbold">Open or Close CDP</p>
                            </div>
                            <div className="right">
                              <ul className="list-unstyled ps-0 mb-0 d-flex align-items-center gap-10">
                                <li className="">
                                  <Button
                                    className="d-flex align-items-center justify-content-center fw-sbold commonBtn"
                                    style={{ minWidth: "unset" }}
                                  >
                                    Open CDP
                                  </Button>
                                </li>
                                <li className="">
                                  <Button
                                    className="d-flex align-items-center justify-content-center fw-sbold commonBtn"
                                    style={{ minWidth: "unset" }}
                                  >
                                    Withdraw
                                  </Button>
                                </li>
                              </ul>
                            </div>
                          </CardCstm>
                        </div>
                        <div className="py-2">
                          <CardCstm
                            className="position-relative p-3 rounded d-flex align-items-center justify-content-between flex-wrap"
                            style={{
                              fontSize: 12,
                              background: "var(--cardBg2)",
                            }}
                          >
                            <div className="left">
                              <p className="m-0 fw-sbold">Health Management</p>
                            </div>
                            <div className="right">
                              <ul className="list-unstyled ps-0 mb-0 d-flex align-items-center gap-10">
                                <li className="">
                                  <Button
                                    className="d-flex align-items-center justify-content-center fw-sbold commonBtn"
                                    style={{ minWidth: "unset" }}
                                  >
                                    Supply
                                  </Button>
                                </li>
                                <li className="">
                                  <Button
                                    className="d-flex align-items-center justify-content-center fw-sbold commonBtn"
                                    style={{ minWidth: "unset" }}
                                  >
                                    Repay
                                  </Button>
                                </li>
                                <li className="">
                                  <Button
                                    className="d-flex align-items-center justify-content-center fw-sbold commonBtn"
                                    style={{ minWidth: "unset" }}
                                  >
                                    Switch
                                  </Button>
                                </li>
                              </ul>
                            </div>
                          </CardCstm>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Container>
            </section>
          </>
        )}
      </ThemeProvider>
    </>
  );
};

const GradientHandleSwitch = styled(Switch)`
  .react-switch-handle {
    background: linear-gradient(180deg, #76fc93 0%, #1f854f 100%) !important;
  }
`;
const CardCstm = styled.div`
  background-color: var(--cardBg);
  border: 1px solid #7aff9b;
  font-size: 14px;
  line-height: 20px;
`;

export default DebtPosition;

const backIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
);

const stripe = (
  <svg
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.374 9.66801H14.591L14.661 9.99901L14.912 9.81901C15.2008 9.64326 15.5373 9.56227 15.8745 9.58738C16.2116 9.61248 16.5324 9.74243 16.792 9.95901C17.227 10.339 17.509 10.865 17.586 11.437C17.7124 12.1116 17.6465 12.8081 17.396 13.447C17.293 13.7394 17.1137 13.999 16.8767 14.1989C16.6397 14.3988 16.3536 14.5318 16.048 14.584C15.6614 14.6597 15.2606 14.5804 14.932 14.363L14.782 14.273V15.83L13.394 16.122L13.374 9.66801ZM14.761 12.101V13.046C14.7598 13.0762 14.7655 13.1063 14.7776 13.1341C14.7897 13.1618 14.808 13.1864 14.831 13.206C14.9188 13.2825 15.0221 13.3393 15.1337 13.3725C15.2454 13.4056 15.3629 13.4145 15.4783 13.3984C15.5936 13.3823 15.7042 13.3416 15.8025 13.2791C15.9008 13.2165 15.9845 13.1337 16.048 13.036C16.2271 12.7323 16.3113 12.382 16.29 12.03C16.2935 11.7123 16.2023 11.4007 16.028 11.135C15.9671 11.0356 15.8849 10.951 15.7871 10.8874C15.6894 10.8238 15.5787 10.7829 15.4631 10.7676C15.3476 10.7522 15.23 10.7629 15.1191 10.7988C15.0082 10.8347 14.9067 10.8949 14.822 10.975C14.786 11.013 14.7647 11.0627 14.762 11.115C14.752 11.467 14.762 11.789 14.762 12.101M19.286 12.613C19.2874 12.7485 19.3232 12.8814 19.39 12.9993C19.4568 13.1172 19.5525 13.2162 19.668 13.287C19.957 13.442 20.29 13.495 20.613 13.437C20.979 13.417 21.338 13.325 21.668 13.167V14.141C21.6729 14.1792 21.6646 14.2179 21.6446 14.2507C21.6247 14.2836 21.5941 14.3087 21.558 14.322C21.0113 14.5738 20.4061 14.6714 19.808 14.604C19.3211 14.5544 18.8664 14.3378 18.521 13.991C18.2384 13.6882 18.0471 13.3117 17.969 12.905C17.7954 12.1651 17.8801 11.3881 18.209 10.703C18.3674 10.3425 18.6328 10.0394 18.9692 9.83478C19.3056 9.63017 19.6969 9.53395 20.0898 9.55917C20.4828 9.58438 20.8585 9.72981 21.166 9.97574C21.4735 10.2217 21.698 10.5562 21.809 10.934C21.927 11.257 21.992 11.596 22 11.94V12.623H19.286V12.613ZM20.693 11.608C20.7086 11.4604 20.6852 11.3112 20.6252 11.1754C20.5652 11.0396 20.4706 10.9219 20.351 10.834C20.2465 10.7604 20.1218 10.7209 19.994 10.7209C19.8662 10.7209 19.7415 10.7604 19.637 10.834C19.5125 10.9214 19.4128 11.0396 19.3476 11.177C19.2825 11.3144 19.254 11.4663 19.265 11.618L20.693 11.608ZM2.13401 12.985L2.38601 13.105C2.72601 13.271 3.09401 13.373 3.47201 13.408C3.62534 13.422 3.77934 13.422 3.93401 13.408C3.98942 13.3946 4.03987 13.3656 4.07949 13.3246C4.11911 13.2836 4.14626 13.2322 4.15779 13.1763C4.16931 13.1205 4.16474 13.0625 4.1446 13.0092C4.12445 12.9558 4.08957 12.9093 4.04401 12.875C3.94334 12.805 3.83634 12.7447 3.72301 12.694C3.40101 12.563 3.07901 12.452 2.71801 12.302C2.52359 12.1961 2.35758 12.0449 2.23405 11.8611C2.11051 11.6774 2.0331 11.4666 2.00837 11.2466C1.98364 11.0266 2.01233 10.8039 2.09199 10.5973C2.17166 10.3907 2.29995 10.2064 2.46601 10.06C2.82069 9.76937 3.26447 9.60944 3.72301 9.60701C4.21201 9.57701 4.70101 9.64801 5.16101 9.81801C5.1894 9.82511 5.21423 9.84234 5.2308 9.86647C5.24738 9.8906 5.25456 9.91995 5.25101 9.94901V11.125C5.03001 11.055 4.81901 10.955 4.59801 10.905C4.37601 10.854 4.06501 10.834 3.80301 10.804C3.73058 10.7877 3.65543 10.7877 3.58301 10.804C3.53643 10.8168 3.49454 10.8428 3.46235 10.8788C3.43017 10.9148 3.40906 10.9594 3.40157 11.0071C3.39407 11.0548 3.4005 11.1037 3.42009 11.1478C3.43968 11.192 3.4716 11.2295 3.51201 11.256C3.61934 11.328 3.73334 11.3883 3.85401 11.437C4.19534 11.5503 4.53034 11.681 4.85901 11.829C5.11788 11.9544 5.32653 12.1639 5.45079 12.4234C5.57505 12.6828 5.60756 12.9767 5.54301 13.257C5.50466 13.565 5.36714 13.8522 5.1512 14.0752C4.93526 14.2981 4.65264 14.4448 4.34601 14.493C3.62001 14.664 2.85701 14.593 2.17501 14.293C2.15873 14.286 2.1446 14.2749 2.13405 14.2606C2.12351 14.2464 2.11694 14.2296 2.11501 14.212V13.005C2.12069 12.9974 2.12643 12.9907 2.13401 12.985ZM5.85401 8.76301L7.20101 8.47101V9.66801H8.20701V10.844H7.20001V12.854C7.19413 12.9369 7.20808 13.02 7.2407 13.0964C7.27332 13.1728 7.32368 13.2403 7.38761 13.2934C7.45153 13.3465 7.52718 13.3836 7.60828 13.4016C7.68939 13.4196 7.77363 13.418 7.85401 13.397C7.98601 13.3837 8.11667 13.3603 8.24601 13.327V14.342C8.24601 14.412 8.24601 14.453 8.16601 14.473C7.69593 14.6489 7.17809 14.6489 6.70801 14.473C6.46713 14.3851 6.25706 14.229 6.10345 14.0238C5.94984 13.8185 5.85934 13.5729 5.84301 13.317C5.83782 13.2501 5.83782 13.1829 5.84301 13.116V8.76301H5.85401ZM8.70001 9.67801H9.79501C9.87501 9.67801 9.89501 9.67801 9.90501 9.76801C9.92301 9.87001 9.94667 9.97067 9.97601 10.07L10.016 9.97001C10.132 9.82184 10.2905 9.71259 10.4703 9.65684C10.65 9.60109 10.8425 9.6015 11.022 9.65801V10.904C10.8678 10.8951 10.7132 10.8951 10.559 10.904C10.4429 10.9155 10.3301 10.9495 10.227 11.004C10.1443 11.0406 10.0748 11.1018 10.0281 11.1793C9.9814 11.2568 9.95972 11.3468 9.96601 11.437V14.503H8.69901L8.70001 9.67801ZM11.474 9.67801H12.851V14.513H11.474V9.67801ZM11.464 9.25501V8.25001C11.464 8.19001 11.464 8.16001 11.534 8.15001L12.821 7.87801V8.96401L11.464 9.25501Z"
      fill="currentColor"
    />
  </svg>
);

const btcIcn = (
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
