"use client";
import BTCAddressPop from "@/components/Modals/BtcAddressPop";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Setting: React.FC = () => {
  const tabs = [
    {
      title: "Help & Support",
      content: <>asdfasdf</>,
    },
    {
      title: "Settings",
      content: <>asdfasdf as2213123</>,
    },
    {
      title: "Alert Preferences",
      content: <>asdfasf 4234234234243234</>,
    },
    {
      title: "Wallet Owner",
      content: <>asdfasf 4234234234243234</>,
    },
    {
      title: "Whitelist Address",
      content: <>asdfasf 4234234234243234</>,
    },
  ];
  const [activeTab, setActiveTab] = useState(1);
  const showTab = (tab: number) => {
    console.log(tab, "tab");

    setActiveTab(tab);
  };
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
      <section className="position-relative dashboard py-3">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12 my-2">
              <div className="sectionHeader pb-2 border-bottom border-secondary mb-4">
                <div className="d-flex align-items-center gap-3">
                  <button
                    onClick={handleGoBack}
                    className="border-0 themeClr p-0"
                  >
                    {backIcn}
                  </button>
                  <h4 className="m-0 text-2xl font-bold">Setting & Support</h4>
                </div>
              </div>
            </div>
            <div className="col-span-12 my-2">
              <div className="grid gap-3 grid-cols-12">
                <div className=" col-span-12">
                  <div
                    className="flex nav navpillsTab  flex-nowrap border-b gap-2  overflow-x-auto"
                    style={{ borderColor: "#424242" }}
                  >
                    {tabs &&
                      tabs.length > 0 &&
                      tabs.map((item, key) => (
                        <button
                          key={key}
                          onClick={() => showTab(key)}
                          className={`${
                            activeTab === key && "active"
                          } tab-button font-medium relative py-2 flex-shrink-0 rounded-bl-none rounded-br-none text-xs px-3 py-2 btn`}
                        >
                          {item.title}
                        </button>
                      ))}
                  </div>
                </div>
                <div className=" col-span-12">
                  <div className={` tabContent pt-3`}>
                    {tabs &&
                      tabs.length > 0 &&
                      tabs.map((item, key) => {
                        if (activeTab !== key) return;
                        return (
                          <div
                            key={key}
                            id="tabContent1"
                            className={`${
                              activeTab === key && "block"
                            } tab-content border-0`}
                          >
                            {item.content}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
              {/* <Tab.Container id="left-tabs-example" defaultActiveKey="Help">
                <div className="grid gap-3 grid-cols-12">
                  <div className="sm:col-span-3 col-span-12">
                    <NavList
                      variant="pills"
                      className="flex-column p-3 rounded-3 shadow"
                      style={{ backgroundColor: "var(--cardBg2)" }}
                    >
                      <Nav.Item className="py-2">
                        <Nav.Link
                          className="d-flex align-items-center gap-3 bg-transparent fw-sbold py-2"
                          eventKey="Help"
                        >
                          <span className="icn ">{helpIcn}</span>
                          Help & Support
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item className="py-2">
                        <Nav.Link
                          className="d-flex align-items-center gap-3 bg-transparent fw-sbold py-2"
                          eventKey="CardSettings"
                        >
                          <span className="icn">{settingIcn}</span> Card
                          Settings
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item className="py-2">
                        <Nav.Link
                          className="d-flex align-items-center gap-3 bg-transparent fw-sbold py-2"
                          eventKey="Alert"
                        >
                          <span className="icn">{alertIcn}</span>
                          Alert Preferences
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item className="py-2">
                        <Nav.Link
                          className="d-flex align-items-center gap-3 bg-transparent fw-sbold py-2"
                          eventKey="WalletOwner"
                        >
                          <span className="icn">{walletIcn}</span>
                          Wallet Owner
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item className="py-2">
                        <Nav.Link
                          className="d-flex align-items-center gap-3 bg-transparent fw-sbold py-2"
                          eventKey="WhitelistAddress"
                        >
                          <span className="icn">{whitelistIcn}</span>
                          Whitelist Address
                        </Nav.Link>
                      </Nav.Item>
                    </NavList>
                  </div>
                  <div className="sm:col-span-3 col-span-12">
                    <Tab.Content>
                      <Tab.Pane eventKey="Help">First tab content</Tab.Pane>
                      <Tab.Pane eventKey="CardSettings">
                        Second tab content
                      </Tab.Pane>
                      <Tab.Pane eventKey="Alert">Second tab content</Tab.Pane>
                      <Tab.Pane eventKey="WalletOwner">
                        Second tab content
                      </Tab.Pane>
                      <Tab.Pane eventKey="WhitelistAddress">
                        Second tab content
                      </Tab.Pane>
                    </Tab.Content>
                  </div>
                </div>
              </Tab.Container> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// const NavList = styled(Nav)`
//   font-size: 12px;
//   a {
//     color: currentColor;
//     &.active,
//     &:hover {
//       color: #76fc93 !important;
//     }
//   }
// `;

export default Setting;

const helpIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.95 18C12.3 18 12.596 17.879 12.838 17.637C13.08 17.395 13.2007 17.0993 13.2 16.75C13.1993 16.4007 13.0787 16.1047 12.838 15.862C12.5973 15.6193 12.3013 15.4987 11.95 15.5C11.5987 15.5013 11.303 15.6223 11.063 15.863C10.823 16.1037 10.702 16.3993 10.7 16.75C10.698 17.1007 10.819 17.3967 11.063 17.638C11.307 17.8793 11.6027 18 11.95 18ZM11.05 14.15H12.9C12.9 13.6 12.9627 13.1667 13.088 12.85C13.2133 12.5333 13.5673 12.1 14.15 11.55C14.5833 11.1167 14.925 10.704 15.175 10.312C15.425 9.92 15.55 9.44933 15.55 8.9C15.55 7.96666 15.2083 7.25 14.525 6.75C13.8417 6.25 13.0333 6 12.1 6C11.15 6 10.3793 6.25 9.788 6.75C9.19667 7.25 8.784 7.85 8.55 8.55L10.2 9.2C10.2833 8.9 10.471 8.575 10.763 8.225C11.055 7.875 11.5007 7.7 12.1 7.7C12.6333 7.7 13.0333 7.846 13.3 8.138C13.5667 8.43 13.7 8.75066 13.7 9.1C13.7 9.43333 13.6 9.746 13.4 10.038C13.2 10.33 12.95 10.6007 12.65 10.85C11.9167 11.5 11.4667 11.9917 11.3 12.325C11.1333 12.6583 11.05 13.2667 11.05 14.15ZM12 22C10.6167 22 9.31667 21.7377 8.1 21.213C6.88334 20.6883 5.825 19.9757 4.925 19.075C4.025 18.1743 3.31267 17.116 2.788 15.9C2.26333 14.684 2.00067 13.384 2 12C1.99933 10.616 2.262 9.316 2.788 8.1C3.314 6.884 4.02633 5.82566 4.925 4.925C5.82367 4.02433 6.882 3.312 8.1 2.788C9.318 2.264 10.618 2.00133 12 2C13.382 1.99866 14.682 2.26133 15.9 2.788C17.118 3.31466 18.1763 4.027 19.075 4.925C19.9737 5.823 20.6863 6.88133 21.213 8.1C21.7397 9.31866 22.002 10.6187 22 12C21.998 13.3813 21.7353 14.6813 21.212 15.9C20.6887 17.1187 19.9763 18.177 19.075 19.075C18.1737 19.973 17.1153 20.6857 15.9 21.213C14.6847 21.7403 13.3847 22.0027 12 22Z"
      fill="currentColor"
    />
  </svg>
);

const settingIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13.984 2.542C14.071 2.711 14.093 2.928 14.136 3.362C14.218 4.182 14.259 4.592 14.431 4.818C14.5382 4.95832 14.6806 5.06777 14.8437 5.13522C15.0069 5.20266 15.185 5.2257 15.36 5.202C15.64 5.165 15.96 4.904 16.598 4.382C16.935 4.105 17.104 3.967 17.285 3.909C17.5155 3.83534 17.7649 3.84777 17.987 3.944C18.162 4.02 18.317 4.174 18.624 4.482L19.518 5.376C19.826 5.684 19.98 5.838 20.056 6.013C20.1522 6.23506 20.1647 6.48447 20.091 6.715C20.033 6.896 19.895 7.065 19.619 7.402C19.096 8.041 18.835 8.36 18.797 8.641C18.7736 8.8159 18.7969 8.99387 18.8645 9.15686C18.9321 9.31985 19.0417 9.46204 19.182 9.569C19.407 9.741 19.818 9.782 20.639 9.864C21.072 9.907 21.289 9.929 21.459 10.016C21.6735 10.1272 21.8404 10.3123 21.929 10.537C22 10.714 22 10.932 22 11.368V12.632C22 13.068 22 13.286 21.93 13.462C21.8411 13.6874 21.6734 13.8729 21.458 13.984C21.289 14.071 21.072 14.093 20.638 14.136C19.818 14.218 19.408 14.259 19.182 14.431C19.0417 14.5382 18.9322 14.6806 18.8648 14.8437C18.7973 15.0069 18.7743 15.185 18.798 15.36C18.836 15.64 19.097 15.96 19.619 16.598C19.895 16.935 20.033 17.103 20.091 17.285C20.1647 17.5155 20.1522 17.7649 20.056 17.987C19.98 18.162 19.826 18.316 19.518 18.624L18.624 19.517C18.316 19.826 18.162 19.98 17.987 20.055C17.7649 20.1512 17.5155 20.1637 17.285 20.09C17.104 20.032 16.935 19.894 16.598 19.618C15.959 19.096 15.64 18.835 15.36 18.798C15.185 18.7743 15.0069 18.7973 14.8437 18.8648C14.6806 18.9322 14.5382 19.0417 14.431 19.182C14.259 19.407 14.218 19.817 14.136 20.638C14.093 21.072 14.071 21.289 13.984 21.458C13.8732 21.6732 13.6881 21.8409 13.463 21.93C13.286 22 13.068 22 12.632 22H11.368C10.932 22 10.714 22 10.538 21.93C10.3126 21.8411 10.1271 21.6734 10.016 21.458C9.929 21.289 9.907 21.072 9.864 20.638C9.782 19.818 9.741 19.408 9.569 19.182C9.46192 19.0418 9.31968 18.9325 9.1567 18.8651C8.99372 18.7976 8.81581 18.7745 8.641 18.798C8.36 18.835 8.041 19.096 7.402 19.618C7.065 19.895 6.896 20.033 6.715 20.091C6.48447 20.1647 6.23506 20.1522 6.013 20.056C5.838 19.98 5.683 19.826 5.376 19.518L4.482 18.624C4.174 18.316 4.02 18.162 3.944 17.987C3.84777 17.7649 3.83534 17.5155 3.909 17.285C3.967 17.104 4.105 16.935 4.381 16.598C4.904 15.959 5.165 15.64 5.202 15.359C5.22552 15.1842 5.20239 15.0063 5.13495 14.8433C5.06751 14.6803 4.95816 14.5381 4.818 14.431C4.593 14.259 4.182 14.218 3.361 14.136C2.928 14.093 2.711 14.071 2.541 13.984C2.32655 13.8728 2.1596 13.6877 2.071 13.463C2 13.286 2 13.068 2 12.632V11.368C2 10.932 2 10.714 2.07 10.538C2.15889 10.3126 2.32661 10.1271 2.542 10.016C2.711 9.929 2.928 9.907 3.362 9.864C4.182 9.782 4.593 9.741 4.818 9.569C4.95834 9.46204 5.06788 9.31985 5.1355 9.15686C5.20312 8.99387 5.22641 8.8159 5.203 8.641C5.165 8.36 4.903 8.041 4.381 7.401C4.105 7.064 3.967 6.896 3.909 6.714C3.83534 6.48347 3.84777 6.23406 3.944 6.012C4.02 5.838 4.174 5.683 4.482 5.375L5.376 4.482C5.684 4.174 5.838 4.019 6.013 3.944C6.23506 3.84777 6.48447 3.83534 6.715 3.909C6.896 3.967 7.065 4.105 7.402 4.381C8.041 4.903 8.36 5.164 8.64 5.202C8.81521 5.22578 8.9936 5.20267 9.15697 5.13504C9.32034 5.06741 9.46286 4.95766 9.57 4.817C9.74 4.592 9.782 4.182 9.864 3.361C9.907 2.928 9.929 2.711 10.016 2.541C10.127 2.32617 10.3121 2.15884 10.537 2.07C10.714 2 10.932 2 11.368 2H12.632C13.068 2 13.286 2 13.462 2.07C13.6874 2.15889 13.8729 2.32661 13.984 2.542ZM12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16Z"
      fill="currentColor"
    />
  </svg>
);

const alertIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.299 3.14799L21.933 18.102C22.0646 18.33 22.134 18.5887 22.134 18.852C22.134 19.1153 22.0646 19.374 21.933 19.602C21.8014 19.83 21.612 20.0194 21.384 20.151C21.156 20.2827 20.8973 20.352 20.634 20.352H3.36599C3.10269 20.352 2.84403 20.2827 2.616 20.151C2.38798 20.0194 2.19863 19.83 2.06698 19.602C1.93533 19.374 1.86603 19.1153 1.86603 18.852C1.86603 18.5887 1.93534 18.33 2.06699 18.102L10.701 3.14799C11.278 2.14799 12.721 2.14799 13.299 3.14799ZM12 15C11.7348 15 11.4804 15.1054 11.2929 15.2929C11.1053 15.4804 11 15.7348 11 16C11 16.2652 11.1053 16.5196 11.2929 16.7071C11.4804 16.8946 11.7348 17 12 17C12.2652 17 12.5196 16.8946 12.7071 16.7071C12.8946 16.5196 13 16.2652 13 16C13 15.7348 12.8946 15.4804 12.7071 15.2929C12.5196 15.1054 12.2652 15 12 15ZM12 8C11.7551 8.00003 11.5187 8.08995 11.3356 8.25271C11.1526 8.41547 11.0356 8.63974 11.007 8.883L11 9V13C11.0003 13.2549 11.0979 13.5 11.2728 13.6854C11.4478 13.8707 11.6869 13.9822 11.9414 13.9972C12.1958 14.0121 12.4464 13.9293 12.6418 13.7657C12.8373 13.6021 12.9629 13.3701 12.993 13.117L13 13V9C13 8.73478 12.8946 8.48043 12.7071 8.29289C12.5196 8.10535 12.2652 8 12 8Z"
      fill="currentColor"
    />
  </svg>
);

const walletIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 20C4.9 20 3.95833 19.6083 3.175 18.825C2.39167 18.0417 2 17.1 2 16V8C2 6.9 2.39167 5.95833 3.175 5.175C3.95833 4.39167 4.9 4 6 4H18C19.1 4 20.0417 4.39167 20.825 5.175C21.6083 5.95833 22 6.9 22 8V16C22 17.1 21.6083 18.0417 20.825 18.825C20.0417 19.6083 19.1 20 18 20H6ZM6 8H18C18.3667 8 18.7167 8.04167 19.05 8.125C19.3833 8.20833 19.7 8.34167 20 8.525V8C20 7.45 19.8043 6.97933 19.413 6.588C19.0217 6.19667 18.5507 6.00067 18 6H6C5.45 6 4.97933 6.196 4.588 6.588C4.19667 6.98 4.00067 7.45067 4 8V8.525C4.3 8.34167 4.61667 8.20833 4.95 8.125C5.28333 8.04167 5.63333 8 6 8ZM4.15 11.25L15.275 13.95C15.425 13.9833 15.575 13.9833 15.725 13.95C15.875 13.9167 16.0167 13.85 16.15 13.75L19.625 10.85C19.4417 10.6 19.2083 10.396 18.925 10.238C18.6417 10.08 18.3333 10.0007 18 10H6C5.56667 10 5.18767 10.1127 4.863 10.338C4.53833 10.5633 4.30067 10.8673 4.15 11.25Z"
      fill="currentColor"
    />
  </svg>
);

const whitelistIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 18 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.5 1H1.5C0.671875 1 0 1.67188 0 2.5V13.5C0 14.3281 0.671875 15 1.5 15H16.5C17.3281 15 18 14.3281 18 13.5V2.5C18 1.67188 17.3281 1 16.5 1ZM5.5 4C6.60312 4 7.5 4.89688 7.5 6C7.5 7.10312 6.60312 8 5.5 8C4.39688 8 3.5 7.10312 3.5 6C3.5 4.89688 4.39688 4 5.5 4ZM9 11.4C9 11.7312 8.6875 12 8.3 12H2.7C2.3125 12 2 11.7312 2 11.4V10.8C2 9.80625 2.94062 9 4.1 9H4.25625C4.64062 9.15937 5.05937 9.25 5.5 9.25C5.94063 9.25 6.3625 9.15937 6.74375 9H6.9C8.05938 9 9 9.80625 9 10.8V11.4ZM16 9.75C16 9.8875 15.8875 10 15.75 10H11.25C11.1125 10 11 9.8875 11 9.75V9.25C11 9.1125 11.1125 9 11.25 9H15.75C15.8875 9 16 9.1125 16 9.25V9.75ZM16 7.75C16 7.8875 15.8875 8 15.75 8H11.25C11.1125 8 11 7.8875 11 7.75V7.25C11 7.1125 11.1125 7 11.25 7H15.75C15.8875 7 16 7.1125 16 7.25V7.75ZM16 5.75C16 5.8875 15.8875 6 15.75 6H11.25C11.1125 6 11 5.8875 11 5.75V5.25C11 5.1125 11.1125 5 11.25 5H15.75C15.8875 5 16 5.1125 16 5.25V5.75Z"
      fill="currentColor"
    />
  </svg>
);

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
