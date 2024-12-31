"use client";
import { ThemeProvider } from "@/components/ContextApi/ThemeContext";
import Header from "@/components/Header";
import Loader from "@/components/loader";
import BTCAddressPop from "@/components/Modals/BtcAddressPop";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Form, Nav, Row, Tab } from "react-bootstrap";
import BtcExchangePop from "@/components/Modals/BtcExchangePop/index";
import styled from "styled-components";

const PurchasePage: React.FC = () => {
  const router = useRouter();
  const [showFirstComponent, setShowFirstComponent] = useState(true);
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
                        <h4 className="m-0">Purchase Yubikeys</h4>
                      </div>
                    </div>
                  </Col>
                  <Col lg="12" className="my-2">
                    <Row>
                      <Col lg="6" className="my-2">
                        <CardCstm className="position-relative p-3 p-lg-4 rounded-3">
                          <div className="top pb-3">
                            <h4 className="m-0 fw-bold">Details</h4>
                          </div>
                          <div className="content">
                            <Form>
                              <Row>
                                <Col lg="12" className="my-2">
                                  <label htmlFor="" className="form-label m-0">
                                    Model
                                  </label>
                                  <input type="text" className="form-control" />
                                </Col>
                                <Col lg="12" className="my-2">
                                  <label htmlFor="" className="form-label m-0">
                                    Quantity
                                  </label>
                                  <input type="text" className="form-control" />
                                </Col>
                              </Row>
                            </Form>
                          </div>
                        </CardCstm>
                      </Col>
                      <Col md="6" className="my-2">
                        <Row className="justify-content-center">
                          <Col className="col-6 my-2">
                            <div className="cardCstm text-center">
                              <div className="icnWrp mb-3">{packageIcn}</div>
                              <p className="m-0 fw-sbold themeClr pb-1">
                                Shipping
                              </p>
                              <p className="m-0" style={{ fontSize: 12 }}>
                                Philedelphia, PA
                              </p>
                            </div>
                          </Col>
                          <Col className="col-6 my-2">
                            <div className="cardCstm text-center">
                              <div className="icnWrp mb-3">{chipIcn}</div>
                              <p className="m-0 fw-sbold themeClr pb-1">
                                Model 5C NFC
                              </p>
                              <p className="m-0" style={{ fontSize: 12 }}>
                                100 Units
                              </p>
                            </div>
                          </Col>
                          <Col lg="6" className="my-2 pt-4">
                            <a
                              href="https://www.yubico.com/support/resellers/"
                              target="_blank"
                              className="d-flex btn fw-sbold  text-dark w-100 align-items-center justify-content-center commonBtn"
                            >
                              Purchase
                            </a>
                          </Col>
                        </Row>
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

const CardCstm = styled.div`
  background-color: var(--cardBg);
  border: 1px solid #7aff9b;
  font-size: 14px;
  line-height: 20px;
`;

export default PurchasePage;

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

const packageIcn = (
  <svg
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.669 2.28201C11.887 2.23901 12.112 2.23901 12.331 2.28201C12.582 2.33001 12.81 2.44901 13.022 2.55901L13.075 2.58701L21.345 6.86701C21.467 6.93024 21.5694 7.02581 21.6408 7.14326C21.7122 7.26071 21.75 7.39554 21.75 7.53301V15.431C21.75 15.714 21.752 16.014 21.657 16.293C21.5734 16.536 21.4387 16.7584 21.262 16.945C21.057 17.159 20.789 17.296 20.539 17.425L20.476 17.458L12.345 21.666C12.2384 21.7212 12.1201 21.7501 12 21.7501C11.8799 21.7501 11.7616 21.7212 11.655 21.666L3.52399 17.458L3.46099 17.425C3.21099 17.296 2.94299 17.159 2.73799 16.945C2.56128 16.7584 2.4266 16.536 2.34299 16.293C2.24799 16.013 2.24899 15.713 2.24999 15.43V7.53301C2.24998 7.39554 2.28775 7.26071 2.35917 7.14326C2.4306 7.02581 2.53293 6.93024 2.65499 6.86701L10.924 2.58701L10.977 2.56001C11.19 2.44901 11.417 2.33001 11.669 2.28201ZM11.895 3.77801C11.7999 3.82288 11.7059 3.86989 11.613 3.91901L4.66799 7.51401L7.49499 8.89801L14.851 5.19501L12.386 3.91901C12.2931 3.86989 12.199 3.82288 12.104 3.77801L12.046 3.75401M16.496 6.04601L9.18599 9.72601L12 11.102L19.332 7.51401L16.496 6.04601ZM11.25 19.766V12.406L8.24999 10.937V11.937C8.24999 12.1359 8.17097 12.3267 8.03032 12.4673C7.88967 12.608 7.6989 12.687 7.49999 12.687C7.30108 12.687 7.11031 12.608 6.96966 12.4673C6.82901 12.3267 6.74999 12.1359 6.74999 11.937V10.203L3.74999 8.73501V15.359C3.74999 15.546 3.74999 15.653 3.75499 15.734L3.76399 15.812C3.77693 15.8469 3.79626 15.8792 3.82099 15.907C3.82599 15.911 3.84199 15.924 3.88499 15.949C3.95299 15.991 4.04799 16.039 4.21299 16.125L11.25 19.766Z"
      fill="currentColor"
    />
  </svg>
);

const chipIcn = (
  <svg
    width="50"
    height="50"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 6V10H10V6H6Z" fill="currentColor" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M5.75 1C5.55109 1 5.36032 1.07902 5.21967 1.21967C5.07902 1.36032 5 1.55109 5 1.75V3C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5H1.75C1.55109 5 1.36032 5.07902 1.21967 5.21967C1.07902 5.36032 1 5.55109 1 5.75C1 5.94891 1.07902 6.13968 1.21967 6.28033C1.36032 6.42098 1.55109 6.5 1.75 6.5H3V7.25H1.75C1.55109 7.25 1.36032 7.32902 1.21967 7.46967C1.07902 7.61032 1 7.80109 1 8C1 8.19891 1.07902 8.38968 1.21967 8.53033C1.36032 8.67098 1.55109 8.75 1.75 8.75H3V9.5H1.75C1.55109 9.5 1.36032 9.57902 1.21967 9.71967C1.07902 9.86032 1 10.0511 1 10.25C1 10.4489 1.07902 10.6397 1.21967 10.7803C1.36032 10.921 1.55109 11 1.75 11H3C3 11.5304 3.21071 12.0391 3.58579 12.4142C3.96086 12.7893 4.46957 13 5 13V14.25C5 14.4489 5.07902 14.6397 5.21967 14.7803C5.36032 14.921 5.55109 15 5.75 15C5.94891 15 6.13968 14.921 6.28033 14.7803C6.42098 14.6397 6.5 14.4489 6.5 14.25V13H7.25V14.25C7.25 14.4489 7.32902 14.6397 7.46967 14.7803C7.61032 14.921 7.80109 15 8 15C8.19891 15 8.38968 14.921 8.53033 14.7803C8.67098 14.6397 8.75 14.4489 8.75 14.25V13H9.5V14.25C9.5 14.4489 9.57902 14.6397 9.71967 14.7803C9.86032 14.921 10.0511 15 10.25 15C10.4489 15 10.6397 14.921 10.7803 14.7803C10.921 14.6397 11 14.4489 11 14.25V13C11.5304 13 12.0391 12.7893 12.4142 12.4142C12.7893 12.0391 13 11.5304 13 11H14.25C14.4489 11 14.6397 10.921 14.7803 10.7803C14.921 10.6397 15 10.4489 15 10.25C15 10.0511 14.921 9.86032 14.7803 9.71967C14.6397 9.57902 14.4489 9.5 14.25 9.5H13V8.75H14.25C14.4489 8.75 14.6397 8.67098 14.7803 8.53033C14.921 8.38968 15 8.19891 15 8C15 7.80109 14.921 7.61032 14.7803 7.46967C14.6397 7.32902 14.4489 7.25 14.25 7.25H13V6.5H14.25C14.4489 6.5 14.6397 6.42098 14.7803 6.28033C14.921 6.13968 15 5.94891 15 5.75C15 5.55109 14.921 5.36032 14.7803 5.21967C14.6397 5.07902 14.4489 5 14.25 5H13C13 4.46957 12.7893 3.96086 12.4142 3.58579C12.0391 3.21071 11.5304 3 11 3V1.75C11 1.55109 10.921 1.36032 10.7803 1.21967C10.6397 1.07902 10.4489 1 10.25 1C10.0511 1 9.86032 1.07902 9.71967 1.21967C9.57902 1.36032 9.5 1.55109 9.5 1.75V3H8.75V1.75C8.75 1.55109 8.67098 1.36032 8.53033 1.21967C8.38968 1.07902 8.19891 1 8 1C7.80109 1 7.61032 1.07902 7.46967 1.21967C7.32902 1.36032 7.25 1.55109 7.25 1.75V3H6.5V1.75C6.5 1.55109 6.42098 1.36032 6.28033 1.21967C6.13968 1.07902 5.94891 1 5.75 1ZM11 4.5C11.1326 4.5 11.2598 4.55268 11.3536 4.64645C11.4473 4.74021 11.5 4.86739 11.5 5V11C11.5 11.1326 11.4473 11.2598 11.3536 11.3536C11.2598 11.4473 11.1326 11.5 11 11.5H5C4.86739 11.5 4.74021 11.4473 4.64645 11.3536C4.55268 11.2598 4.5 11.1326 4.5 11V5C4.5 4.86739 4.55268 4.74021 4.64645 4.64645C4.74021 4.55268 4.86739 4.5 5 4.5H11Z"
      fill="currentColor"
    />
  </svg>
);
