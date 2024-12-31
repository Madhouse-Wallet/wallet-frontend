"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { ThemeProvider } from "@/components/ContextApi/ThemeContext";

// css
// import AreaChart from "@/components/graph/AreaChart/index";

// img
import p1 from "@/public/user.png";
import Loader from "@/components/loader/index";
import Aerodrome from "../../../Assets/images/Aerodrome.png";
import BUSD from "../../../Assets/images/BUSD.png";
import Velodrome from "../../../Assets/images/Velodrome.png";
import CounterList from "@/components/CounterList/index";
import { CardCstm, GreyBtn } from "./DashboardStyled";
import Slider from "react-slick";
import BTCAddressPop from "@/components/Modals/BtcAddressPop/index";
import NFTSlider from "./NFTSlider";
import TransactionTable from "./TransactionTable";
import MyActivity from "./myActivity";
import Header from "@/components/Header";
import Image from "next/image";
import dynamic from "next/dynamic";

const AreaChart = dynamic(() => import("@/components/graph/AreaChart/index"), {
  ssr: false,
});

interface CardData {
  head: string;
  value: string;
  icn: React.ReactNode;
}

interface BtcCardItem {
  icn: React.ReactNode;
  icn1: React.ReactNode;
  exchange: string;
  liquidity: string;
  CurrentAPY: string;
  monthAPY: string;
  btcHead: string;
  cardTitle: string;
  cardDescp: string;
  btns: string[];
  list: string[];
}

const Dashboard: React.FC = () => {
  const cardData: CardData[] = [
    { head: "Total Deposit", value: "$234234", icn: icn1 },
    { head: "Earned", value: "$234234", icn: icn2 },
    { head: "Daily Rewards", value: "$234234", icn: icn3 },
    { head: "APR", value: "$234234", icn: icn1 },
    { head: "Total Deposit", value: "$234234", icn: icn1 },
    { head: "Earned", value: "$234234", icn: icn2 },
    { head: "Daily Rewards", value: "$234234", icn: icn3 },
    { head: "APR", value: "$234234", icn: icn1 },
  ];

  const BtcCard: BtcCardItem[] = [
    {
      icn: btcIcn,
      icn1: usdt,
      exchange: "Mainnet Aaave tBTC ==> Tether",
      liquidity: "$175m",
      CurrentAPY: "6.3%",
      monthAPY: "4.5%",
      btcHead: "BTC ==> OP Bridge & Yield Farm",
      cardTitle: "Velodrome Finance",
      cardDescp:
        "Velodrome Finance is a next-generation AMM that combines the best of curve. Convex and Uniswa...",
      btns: ["Delfi", "Governance", "Yield"],
      list: [
        "Deposit BTC into Madhouse Wallet",
        "Deposit BTC into Madhouse Coverage",
        "Withdraw BTC from Madhouse Coverage",
      ],
    },
    {
      icn: btcIcn,
      icn1: usdc,
      exchange: "Mainnet Aaave tBTC ==> usdc",
      liquidity: "$200m",
      CurrentAPY: "6%",
      monthAPY: "4%",
      btcHead: "BTC ==> Base Bridge & Yield Farm",
      cardTitle: "Aerodrome Finance",
      cardDescp:
        "Aerodrome Finance is a next-generation AMM that combines the best of curve. Convex and Uniswa...",
      btns: ["Delfi", "Governance", "Yield"],
      list: [
        "Deposit BTC into Madhouse Wallet",
        "Deposit BTC into Madhouse Coverage",
        "Withdraw BTC from Madhouse Coverage",
      ],
    },
    {
      icn: btcIcn,
      icn1: dai,
      exchange: "Mainnet Aaave tBTC ==> usdc",
      liquidity: "$17m",
      CurrentAPY: "6.5%",
      monthAPY: "5%",
      btcHead: "BTC ==> Borrow USD",
      cardTitle: "Threshold USD",
      cardDescp:
        "Threshold USD (thUSD) is a stablecoin soft-pegged against USD and backed by ETH and tBTC",
      btns: ["Stablecoin"],
      list: [
        "Deposit BTC into Madhouse Wallet",
        "Borrow and Redeem USD/Buy Coverage",
        "Withdraw BTC from Madhouse Coverage",
      ],
    },
  ];

  const [showData, setShowData] = useState<number | null>(null);
  const [btcAddress, setBtcAddress] = useState<boolean>(false);

  const BtcCardSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handleDataBtc = (key: number) => {
    setShowData((prevKey) => (prevKey === key ? null : key));
  };

  const handleAddressPop = () => setBtcAddress(!btcAddress);
  const [showFirstComponent, setShowFirstComponent] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFirstComponent(false); // Hide the first component after 4-5 seconds
    }, 3000); // 5000ms = 5 seconds

    // Cleanup timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ThemeProvider>
        <BTCAddressPop btcAddress={btcAddress} setBtcAddress={setBtcAddress} />
        {true ? <Header /> : ""}
        {showFirstComponent ? (
          <Loader />
        ) : (
          <section className="position-relative dashboard py-3">
            <Container>
              <Row>
                <Col lg="12" className="my-2">
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <div className="left d-flex align-items-center gap-10">
                      {/* <div className="flex-shrink-0 rounded-circle">
                      <Image
                        src={p1}
                        alt=""
                        style={{ height: 40, width: 40 }}
                        className="img-fluid object-fit-cover rounded-circle"
                      />
                    </div> */}
                      {/* <div className="content">
                      <h6 className="m-0 fw-normal">eth: 324rqwerqwer323423</h6>
                      <div className="d-flex align-items-center gap-10">
                        <Button className="border-0 p-0" variant="transparent">
                          {shareIcn}
                        </Button>
                        <Button className="border-0 p-0" variant="transparent">
                          {redirectIcn}
                        </Button>
                      </div>
                    </div> */}
                    </div>
                    <div className="right">
                      <Button
                        variant="transparent"
                        className="border-0 p-0 themeClr fw-sbold"
                      >
                        <span className="icn me-2">+</span> Add Signer
                      </Button>
                    </div>
                  </div>
                </Col>
                <Col lg="12" className="my-2">
                  <CounterList data={cardData} />
                </Col>
                <Col sm="6" className="my-2">
                  <CardCstm
                    className="rounded-3 p-3 px-lg-4 h-100"
                    style={{ background: "var(--cardBg2)" }}
                  >
                    <div className="top pb-3">
                      <h2 className="m-0 fw-sbold">$ 84,234.27</h2>
                      <p className="m-0 py-1 themeClr">−36.15 (0.15%)</p>
                      <p className="m-0">14 Nov, 12:47 pm IST • Disclaimer</p>
                    </div>
                    <div className="graphBody">
                      <AreaChart />
                    </div>
                  </CardCstm>
                </Col>
                <Col lg="6" className="my-2">
                  <MyActivity />
                </Col>
                <Col lg="12" className="my-2">
                  <TransactionTable />
                </Col>

                <Col lg="12" className="my-2">
                  <Slider {...BtcCardSettings}>
                    {BtcCard.map((item, key) => (
                      <div key={key} className="my-2 px-3">
                        <p className="m-0 text-center">{item.exchange}</p>
                        <CardCstm
                          onClick={() => handleDataBtc(key)}
                          className="cardCstm rounded-3 p-3"
                          style={{ cursor: "pointer" }}
                        >
                          <div className="top d-flex align-items-start justify-content-between pb-2">
                            <span className="icn">{item.icn}</span>
                            <span className="icn">{item.icn1}</span>
                          </div>
                          <div className="content pt-2">
                            <ul
                              className="list-unstyled ps-0 mb-0"
                              style={{ fontSize: 12 }}
                            >
                              <li
                                className="py-1 d-flex align-items-center justify-content-between"
                                style={{
                                  borderBottom: "1px dashed var(--lightBtn)",
                                }}
                              >
                                <span>Available Liquidity</span>
                                <span className="fw-sbold">
                                  {item.liquidity}
                                </span>
                              </li>
                              <li
                                className="py-1 d-flex align-items-center justify-content-between"
                                style={{
                                  borderBottom: "1px dashed var(--lightBtn)",
                                }}
                              >
                                <span>Current APY</span>
                                <span className="fw-sbold">
                                  {item.CurrentAPY}
                                </span>
                              </li>
                              <li
                                className="py-1 d-flex align-items-center justify-content-between"
                                style={{
                                  borderBottom: "1px dashed var(--lightBtn)",
                                }}
                              >
                                <span>Monthly APY</span>
                                <span className="fw-sbold">
                                  {item.monthAPY}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </CardCstm>

                        {showData === key && (
                          <div className="cardDescp my-2">
                            <ul className="list-unstyled p-0 m-0">
                              {item.list.map((data, index) => (
                                <li key={index} className="py-1">
                                  <div
                                    onClick={handleAddressPop}
                                    className="rounded p-3 btn text-white d-flex align-items-center justify-content-center border"
                                    style={{ fontSize: 12 }}
                                  >
                                    {data}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </Slider>
                </Col>
              </Row>
            </Container>
          </section>
        )}
      </ThemeProvider>
    </>
  );
};

export default Dashboard;

const icn1 = (
  <svg
    width="54"
    height="54"
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="27" cy="27" r="27" fill="#76FC93" />
    <path
      d="M30 18C30.2652 18 30.5196 18.1054 30.7071 18.2929C30.8946 18.4804 31 18.7348 31 19V21H35C35.2652 21 35.5196 21.1054 35.7071 21.2929C35.8946 21.4804 36 21.7348 36 22V34H38V36H16V34H18V22C18 21.7348 18.1054 21.4804 18.2929 21.2929C18.4804 21.1054 18.7348 21 19 21H23V19C23 18.7348 23.1054 18.4804 23.2929 18.2929C23.4804 18.1054 23.7348 18 24 18H30ZM23 23H20V34H23V23ZM29 23H25V34H29V23ZM34 23H31V34H34V23ZM29 20H25V21H29V20Z"
      fill="#0d1017"
    />
  </svg>
);

const icn2 = (
  <svg
    width="54"
    height="54"
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="27" cy="27" r="27" fill="#76FC93" />
    <path
      d="M18.75 19.6875C18.75 19.17 19.17 18.75 19.6875 18.75H21.75V24.0533L19.6335 22.9073C19.3662 22.7624 19.143 22.548 18.9875 22.2867C18.8319 22.0255 18.7499 21.727 18.75 21.423V19.6875ZM23.25 24.8655V18.75H30.75V24.8655L27.09 26.8485C27.0624 26.8636 27.0315 26.8715 27 26.8715C26.9685 26.8715 26.9376 26.8636 26.91 26.8485L23.25 24.8655ZM32.25 24.0533V18.75H34.3125C34.83 18.75 35.25 19.17 35.25 19.6875V21.423C35.2501 21.727 35.1681 22.0255 35.0125 22.2867C34.857 22.548 34.6338 22.7624 34.3665 22.9073L32.25 24.0533ZM19.6875 17.25C19.041 17.25 18.421 17.5068 17.9639 17.9639C17.5068 18.421 17.25 19.041 17.25 19.6875V21.423C17.25 21.9972 17.4052 22.5608 17.699 23.0541C17.9929 23.5475 18.4146 23.9523 18.9195 24.2257L24.9083 27.4703C23.9086 27.945 23.1002 28.7458 22.616 29.7409C22.1318 30.736 22.0006 31.8662 22.2439 32.9458C22.4873 34.0254 23.0907 34.99 23.955 35.6812C24.8192 36.3723 25.893 36.7489 26.9996 36.7489C28.1063 36.7489 29.18 36.3723 30.0443 35.6812C30.9086 34.99 31.512 34.0254 31.7553 32.9458C31.9987 31.8662 31.8674 30.736 31.3832 29.7409C30.899 28.7458 30.0906 27.945 29.091 27.4703L35.0805 24.2257C35.5854 23.9523 36.0071 23.5475 36.301 23.0541C36.5948 22.5608 36.75 21.9972 36.75 21.423V19.6875C36.75 19.041 36.4932 18.421 36.0361 17.9639C35.579 17.5068 34.959 17.25 34.3125 17.25H19.6875ZM23.625 31.875C23.625 30.9799 23.9806 30.1215 24.6135 29.4885C25.2465 28.8556 26.1049 28.5 27 28.5C27.8951 28.5 28.7535 28.8556 29.3865 29.4885C30.0194 30.1215 30.375 30.9799 30.375 31.875C30.375 32.7701 30.0194 33.6285 29.3865 34.2615C28.7535 34.8944 27.8951 35.25 27 35.25C26.1049 35.25 25.2465 34.8944 24.6135 34.2615C23.9806 33.6285 23.625 32.7701 23.625 31.875Z"
      fill="black"
    />
  </svg>
);

const icn3 = (
  <svg
    width="54"
    height="54"
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="27" cy="27" r="27" fill="#76FC93" />
    <path
      d="M27 26C27.55 26 28.021 25.8043 28.413 25.413C28.805 25.0217 29.0007 24.5507 29 24C28.9993 23.4493 28.8037 22.9787 28.413 22.588C28.0223 22.1973 27.5513 22.0013 27 22C26.4487 21.9987 25.978 22.1947 25.588 22.588C25.198 22.9813 25.002 23.452 25 24C24.998 24.548 25.194 25.019 25.588 25.413C25.982 25.807 26.4527 26.0027 27 26ZM22 36V34H26V30.9C25.1833 30.7167 24.4543 30.371 23.813 29.863C23.1717 29.355 22.7007 28.7173 22.4 27.95C21.15 27.8 20.1043 27.2543 19.263 26.313C18.4217 25.3717 18.0007 24.2673 18 23V20H22V18H32V20H36V23C36 24.2667 35.579 25.371 34.737 26.313C33.895 27.255 32.8493 27.8007 31.6 27.95C31.3 28.7167 30.8293 29.3543 30.188 29.863C29.5467 30.3717 28.8173 30.7173 28 30.9V34H32V36H22ZM22 25.8V22H20V23C20 23.6333 20.1833 24.2043 20.55 24.713C20.9167 25.2217 21.4 25.584 22 25.8ZM32 25.8C32.6 25.5833 33.0833 25.2207 33.45 24.712C33.8167 24.2033 34 23.6327 34 23V22H32V25.8Z"
      fill="black"
    />
  </svg>
);

const shareIcn = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 12L14 5V9C7 10 4 15 3 20C5.5 16.5 9 14.9 14 14.9V19L21 12Z"
      fill="#7aff9b"
    />
  </svg>
);

const infoIcn = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 17H13V11H11V17ZM12 9C12.2833 9 12.521 8.904 12.713 8.712C12.905 8.52 13.0007 8.28267 13 8C12.9993 7.71733 12.9033 7.48 12.712 7.288C12.5207 7.096 12.2833 7 12 7C11.7167 7 11.4793 7.096 11.288 7.288C11.0967 7.48 11.0007 7.71733 11 8C10.9993 8.28267 11.0953 8.52033 11.288 8.713C11.4807 8.90567 11.718 9.00133 12 9ZM12 22C10.6167 22 9.31667 21.7373 8.1 21.212C6.88334 20.6867 5.825 19.9743 4.925 19.075C4.025 18.1757 3.31267 17.1173 2.788 15.9C2.26333 14.6827 2.00067 13.3827 2 12C1.99933 10.6173 2.262 9.31733 2.788 8.1C3.314 6.88267 4.02633 5.82433 4.925 4.925C5.82367 4.02567 6.882 3.31333 8.1 2.788C9.318 2.26267 10.618 2 12 2C13.382 2 14.682 2.26267 15.9 2.788C17.118 3.31333 18.1763 4.02567 19.075 4.925C19.9737 5.82433 20.6863 6.88267 21.213 8.1C21.7397 9.31733 22.002 10.6173 22 12C21.998 13.3827 21.7353 14.6827 21.212 15.9C20.6887 17.1173 19.9763 18.1757 19.075 19.075C18.1737 19.9743 17.1153 20.687 15.9 21.213C14.6847 21.739 13.3847 22.0013 12 22Z"
      fill="#7aff9b"
    />
  </svg>
);

const bookmarkIcn = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 21V5C5 4.45 5.196 3.97933 5.588 3.588C5.98 3.19667 6.45067 3.00067 7 3H17C17.55 3 18.021 3.196 18.413 3.588C18.805 3.98 19.0007 4.45067 19 5V21L12 18L5 21ZM7 17.95L12 15.8L17 17.95V5H7V17.95Z"
      fill="#7aff9b"
    />
  </svg>
);

const redirectIcn = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.828 12L16.243 13.414L19.071 10.586C19.8212 9.83584 20.2426 8.81839 20.2426 7.7575C20.2426 6.69661 19.8212 5.67916 19.071 4.929C18.6996 4.55756 18.2586 4.26291 17.7733 4.06189C17.288 3.86086 16.7678 3.7574 16.2425 3.7574C15.1816 3.7574 14.1642 4.17883 13.414 4.929L10.586 7.757L12 9.172L14.828 6.343C15.2032 5.96785 15.712 5.75709 16.2425 5.75709C16.773 5.75709 17.2819 5.96785 17.657 6.343C18.0322 6.71815 18.2429 7.22696 18.2429 7.7575C18.2429 8.28804 18.0322 8.79685 17.657 9.172L14.828 12ZM12 14.829L13.414 16.243L10.586 19.071C9.83584 19.8212 8.8184 20.2426 7.7575 20.2426C6.69661 20.2426 5.67917 19.8212 4.929 19.071C4.17884 18.3208 3.7574 17.3034 3.7574 16.2425C3.7574 15.1816 4.17884 14.1642 4.929 13.414L7.757 10.586L9.172 12L6.343 14.829C5.96799 15.2041 5.75736 15.7129 5.75745 16.2434C5.75755 16.7738 5.96836 17.2825 6.3435 17.6575C6.71865 18.0325 7.22741 18.2431 7.75786 18.2431C8.2883 18.243 8.79699 18.0321 9.172 17.657L12 14.829Z"
      fill="#7aff9b"
    />
    <path
      d="M14.829 10.586C15.0166 10.3984 15.1221 10.1439 15.1221 9.8785C15.1221 9.61314 15.0166 9.35864 14.829 9.171C14.6414 8.98336 14.3869 8.87794 14.1215 8.87794C13.8561 8.87794 13.6016 8.98336 13.414 9.171L9.172 13.414C9.07649 13.5062 9.00031 13.6166 8.9479 13.7386C8.89549 13.8606 8.86791 13.9918 8.86675 14.1246C8.8656 14.2574 8.8909 14.3891 8.94118 14.512C8.99146 14.6349 9.06571 14.7465 9.15961 14.8404C9.2535 14.9343 9.36515 15.0085 9.48805 15.0588C9.61094 15.1091 9.74262 15.1344 9.8754 15.1333C10.0082 15.1321 10.1394 15.1045 10.2614 15.0521C10.3834 14.9997 10.4938 14.9235 10.586 14.828L14.829 10.586Z"
      fill="#7aff9b"
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
    <g clip-path="url(#clip0_2_2)">
      <path
        d="M15.7607 9.93462C14.6918 14.2226 10.3474 16.8292 6.06549 15.7603C1.77737 14.6914 -0.829259 10.3472 0.239679 6.06537C1.30855 1.77737 5.64668 -0.829258 9.9348 0.239679C14.2167 1.3023 16.8296 5.64655 15.7607 9.93462Z"
        fill="url(#paint0_linear_2_2)"
      />
      <path
        d="M11.8091 7.00312C11.9653 5.94062 11.1591 5.36562 10.0466 4.98437L10.4091 3.54062L9.53407 3.32187L9.18407 4.72812C8.95282 4.67187 8.71532 4.61562 8.47782 4.56562L8.82782 3.15312L7.95282 2.93437L7.59657 4.37187C7.40282 4.32812 7.21532 4.28437 7.03407 4.24062V4.23437L5.82157 3.93437L5.59032 4.87187C5.59032 4.87187 6.24032 5.02187 6.22782 5.02812C6.58407 5.11562 6.64657 5.35312 6.63407 5.54062L6.22157 7.18437C6.24657 7.19062 6.27782 7.19687 6.31532 7.21562C6.28407 7.20937 6.25282 7.20312 6.22157 7.19062L5.64657 9.49062C5.60282 9.59687 5.49032 9.75937 5.24657 9.69687C5.25282 9.70937 4.60907 9.54062 4.60907 9.54062L4.17157 10.5469L5.31532 10.8344C5.52782 10.8906 5.73407 10.9406 5.94032 10.9969L5.57782 12.4531L6.45282 12.6719L6.81532 11.2281C7.05282 11.2906 7.29032 11.3531 7.51532 11.4094L7.15907 12.8469L8.03407 13.0656L8.39657 11.6094C9.89657 11.8906 11.0216 11.7781 11.4903 10.4219C11.8716 9.33437 11.4716 8.70312 10.6841 8.29062C11.2653 8.15937 11.6966 7.77812 11.8091 7.00312ZM9.80282 9.81562C9.53407 10.9031 7.69657 10.3156 7.10282 10.1656L7.58407 8.23437C8.17782 8.38437 10.0903 8.67812 9.80282 9.81562ZM10.0778 6.98437C9.82782 7.97812 8.30282 7.47187 7.80907 7.34687L8.24657 5.59687C8.74032 5.72187 10.3341 5.95312 10.0778 6.98437Z"
        fill="white"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_2_2"
        x1="799.567"
        y1="-0.384"
        x2="799.567"
        y2="1599.84"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#F9AA4B" />
        <stop offset="1" stop-color="#F7931A" />
      </linearGradient>
      <clipPath id="clip0_2_2">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const dai = (
  <svg
    width="30"
    height="30"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_4_5)">
      <path
        d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
        fill="#F4B731"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.6385 4H7.9145C9.907 4 11.4175 5.058 11.9795 6.597H13V7.5275H12.1945C12.2102 7.6745 12.218 7.82417 12.218 7.9765V7.9995C12.218 8.17083 12.208 8.33917 12.188 8.5045H13V9.4345H11.96C11.3835 10.9525 9.885 12 7.915 12H4.6385V9.4345H3.5V8.5045H4.6385V7.5275H3.5V6.5975H4.6385V4ZM5.554 9.4345V11.1655H7.914C9.371 11.1655 10.453 10.472 10.9565 9.4345H5.554ZM11.237 8.5045H5.554V7.5275H11.239C11.2597 7.68083 11.2702 7.83817 11.2705 7.9995V8.022C11.2705 8.18633 11.2593 8.347 11.237 8.504V8.5045ZM7.915 4.8325C9.378 4.8325 10.4635 5.5445 10.964 6.5965H5.554V4.833H7.914L7.915 4.8325Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_4_5">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const usdt = (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 20L2 10.135L5.815 4H18.185L22 10.135L12 20ZM13 11V9.78C14.8 9.87 16.48 10.22 17 10.675C16.395 11.205 14.23 11.59 12 11.59C9.77 11.59 7.605 11.205 7 10.675C7.515 10.22 9.2 9.875 11 9.775V11H13ZM7 10.67V11.405C7.515 11.86 9.195 12.205 11 12.305V15H13V12.3C14.8 12.21 16.485 11.86 17 11.405V9.94C16.485 9.485 14.8 9.135 13 9.04V8H16V6.5H8V8H11V9.04C9.195 9.135 7.515 9.485 7 9.94V10.67Z"
      fill="#009393"
    />
  </svg>
);

const usdc = (
  <svg
    width="30"
    height="30"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_4_11)">
      <path
        d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
        fill="#3E73C4"
      />
      <path
        d="M10.011 9.062C10.011 8 9.371 7.636 8.091 7.484C7.177 7.3625 6.9945 7.12 6.9945 6.695C6.9945 6.27 7.2995 5.997 7.9085 5.997C8.457 5.997 8.762 6.179 8.914 6.6345C8.92996 6.67847 8.95894 6.71652 8.99709 6.74359C9.03524 6.77066 9.08073 6.78545 9.1275 6.786H9.615C9.64316 6.78675 9.67117 6.78178 9.69735 6.77138C9.72353 6.76098 9.74732 6.74537 9.76728 6.7255C9.78724 6.70563 9.80297 6.68191 9.81349 6.65578C9.82401 6.62966 9.82912 6.60166 9.8285 6.5735V6.5435C9.76892 6.21395 9.60217 5.9133 9.35417 5.68826C9.10616 5.46322 8.79077 5.32638 8.457 5.299V4.571C8.457 4.4495 8.3655 4.3585 8.2135 4.328H7.756C7.6345 4.328 7.543 4.419 7.5125 4.571V5.269C6.598 5.39 6.0195 5.997 6.0195 6.756C6.0195 7.757 6.6285 8.1515 7.9085 8.3035C8.762 8.455 9.036 8.6375 9.036 9.123C9.036 9.608 8.6095 9.942 8.0305 9.942C7.238 9.942 6.964 9.6085 6.8725 9.153C6.8425 9.032 6.7505 8.971 6.659 8.971H6.141C6.11288 8.97032 6.08492 8.97535 6.0588 8.98578C6.03268 8.99621 6.00895 9.01183 5.98904 9.03169C5.96913 9.05155 5.95346 9.07525 5.94297 9.10134C5.93247 9.12744 5.92738 9.15539 5.928 9.1835V9.2135C6.0495 9.9725 6.5375 10.5185 7.543 10.6705V11.399C7.543 11.52 7.6345 11.6115 7.7865 11.6415H8.244C8.3655 11.6415 8.457 11.5505 8.4875 11.399V10.67C9.402 10.5185 10.011 9.881 10.011 9.0615V9.062Z"
        fill="white"
      />
      <path
        d="M6.44599 12.2485C4.06899 11.3985 2.84999 8.7585 3.73399 6.422C4.19099 5.147 5.19649 4.1765 6.44599 3.721C6.56799 3.6605 6.62849 3.5695 6.62849 3.4175V2.9925C6.62849 2.8715 6.56799 2.7805 6.44599 2.75C6.41549 2.75 6.35449 2.75 6.32399 2.78C5.63821 2.99416 5.00156 3.34186 4.4507 3.80309C3.89985 4.26431 3.44567 4.82994 3.11431 5.46741C2.78296 6.10489 2.58098 6.80161 2.51999 7.51746C2.45901 8.23332 2.54024 8.95417 2.75899 9.6385C3.30699 11.3385 4.61749 12.6435 6.32399 13.1895C6.44599 13.25 6.56799 13.1895 6.59799 13.068C6.62849 13.038 6.62849 13.007 6.62849 12.9465V12.5215C6.62849 12.4305 6.53749 12.3095 6.44599 12.2485ZM9.67599 2.7805C9.55399 2.7195 9.43199 2.7805 9.40199 2.9015C9.37149 2.932 9.37149 2.9625 9.37149 3.023V3.448C9.37149 3.5695 9.46249 3.6905 9.55399 3.7515C11.931 4.6015 13.15 7.2415 12.266 9.578C11.809 10.853 10.8035 11.8235 9.55399 12.279C9.43199 12.3395 9.37149 12.4305 9.37149 12.5825V13.0075C9.37149 13.1285 9.43199 13.2195 9.55399 13.25C9.58449 13.25 9.64549 13.25 9.67599 13.22C10.3618 13.0058 10.9984 12.6581 11.5493 12.1969C12.1001 11.7357 12.5543 11.1701 12.8857 10.5326C13.217 9.89511 13.419 9.19839 13.48 8.48254C13.541 7.76668 13.4597 7.04583 13.241 6.3615C12.693 4.6315 11.352 3.3265 9.67599 2.7805Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_4_11">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
