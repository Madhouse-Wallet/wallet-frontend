import BuyBitcoin from "@/components/Modals/buyBitcoinPop";
import BuyCoveragePop from "@/components/Modals/buyCoveragePop";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

const Sidebar = ({ sidebar, setSidebar }) => {
  const router = useRouter();
  const [buycoverage, setBuyCoverage] = useState(false);
  const [buy, setBuy] = useState(false);

  console.log(router.pathname == "/", "asdfas");

  return (
    <>
      {buycoverage &&
        createPortal(
          <BuyCoveragePop
            buycoverage={buycoverage}
            setBuyCoverage={setBuyCoverage}
          />,
          document.body
        )}
      {buy &&
        createPortal(<BuyBitcoin buy={buy} setBuy={setBuy} />, document.body)}
      <SidebarDiv
        sidebar={sidebar}
        className={`${
          sidebar && "active"
        } px-3 py-2 fixed top-0 left-0 z-[99999]`}
      >
        <button
          onClick={() => setSidebar(!sidebar)}
          className="absolute top-2 right-2 lg:hidden"
        >
          {close}
        </button>
        <div className="top pb-2">{logo}</div>
        <div className="sidebarWrpper pt-3">
          <ul className="list-none pl-0 mb-0">
            <li className="py-1">
              <Link
                // isActive={router.pathname == "/" && true}
                href={"/"}
                className={`${
                  router.pathname === "/" && "active"
                } flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{Dashboard}</span>
                Dashboard
              </Link>
            </li>
            <li className="py-1">
              <Link
                // isActive={router.pathname == "/btc-exhange"}
                href={"/btc-exhange"}
                className={`${
                  router.pathname === "/btc-exhange" && "active"
                } flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{icn1}</span>
                Send & Receive Bitcoin
              </Link>
            </li>
            <li className="py-1">
              <Link
                // isActive={router.pathname == "/btc-exhange"}
                href={"/purchase"}
                className={`${
                  router.pathname === "/purchase" && "active"
                } flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{icn2}</span>
                Buy Yubikeys
              </Link>
            </li>
            <li className="py-1">
              <Link
                // isActive={router.pathname == "/btc-exhange"}
                href={"/bitcoin-debt-card"}
                className={`${
                  router.pathname === "/bitcoin-debt-card" && "active"
                } flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{icn3}</span>
                Bitcoin Debit Card
              </Link>
            </li>
            <li className="py-1">
              <Link
                // isActive={router.pathname == "/btc-exhange"}
                href={"/debt-position"}
                className={`${
                  router.pathname === "/debt-position" && "active"
                } flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{icn4}</span>
                Debit Positions
              </Link>
            </li>
            <li className="py-1">
              <Link
                href={""}
                onClick={() => setBuyCoverage(!buycoverage)}
                // isActive={router.pathname == "/btc-exhange"}
                className={` flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{icn5}</span>
                Buy Smart Contract Coverage
              </Link>
            </li>
            <li className="py-1">
              <Link
                href={""}
                onClick={() => setBuy(!buy)}
                // isActive={router.pathname == "/btc-exhange"}
                className={` flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{icn6}</span>
                Buy Bitcoin
              </Link>
            </li>
            <li className="py-1">
              <Link
                // isActive={router.pathname == "/btc-exhange"}
                href={"/approval"}
                className={`${
                  router.pathname === "/approval" && "active"
                } flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{icn7}</span>
                Approvals
              </Link>
            </li>
            <li className="py-1">
              <Link
                // isActive={router.pathname == "/btc-exhange"}
                href={"/stake-bitcoin"}
                className={`${
                  router.pathname === "/stake-bitcoin" && "active"
                } flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{icn8}</span>
                Stake Bitcoin
              </Link>
            </li>
            <li className="py-1">
              <Link
                // isActive={router.pathname == "/btc-exhange"}
                href={"/setting"}
                className={`${
                  router.pathname === "/setting" && "active"
                } flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{icn7}</span>
                Setting & Support
              </Link>
            </li>
            <li className="py-1">
              <Link
                // isActive={router.pathname == "/btc-exhange"}
                href={"/contact"}
                className={`${
                  router.pathname === "/contact" && "active"
                } flex p-2 items-start justify-start gap-2 rounded`}
              >
                <span className="icn">{icn10}</span>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </SidebarDiv>
    </>
  );
};

const SidebarDiv = styled.div`
  transition: 0.4s;
  min-height: 100vh;
  width: 250px;
  flex-shrink: 0;
  background: var(--cardBg2);
  .sidebarWrpper {
    a {
      svg {
        path {
          fill: #808080;
        }
      }
      &.active {
        background: #ff8735;
        svg {
          path {
            fill: currentColor;
          }
        }
      }
    }
  }
  @media (max-width: 1024px) {
    &:not(.active) {
      transform: translateX(-110%);
    }
  }
`;

export default Sidebar;

const logo = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="70"
    height="70"
    viewBox="0 0 100 70"
    fill="none"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M21 20H29V30L21 30V20ZM21 38H10V30H21V38ZM29 38V49H21V38L29 38ZM29 38H40V30H29V38Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M71.2143 54.4276H66.3571V60.4857H60.2857V54.4276H58.7011V54.4143H53V48.3429H58.7011V21.1429H53V15.0714H60.2857V9H66.3571V15.0714H71.2143V9H77.2857V15.0714H75.8286C83.2211 15.0714 87.8573 18.8624 87.8573 24.8901C87.8573 29.1996 84.6394 32.8 80.4659 33.4266V33.6451C85.8112 34.0544 89.7394 37.9546 89.7394 43.1639C89.7394 49.8668 84.8616 54.1447 76.9336 54.4143H77.2857V60.4857H71.2143V54.4276ZM66.9388 21.2084V31.4364H72.8572C77.2481 31.4364 79.7568 29.4996 79.7568 26.1724C79.7568 23.008 77.5468 21.2084 73.7024 21.2084H66.9388ZM66.9388 48.2906H74.0302C78.7756 48.2906 81.339 46.2725 81.339 42.5094C81.339 38.8265 78.6931 36.863 73.8384 36.863H66.94L66.9388 48.2906Z"
      fill="currentColor"
    />
  </svg>
);

const icn1 = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.9425 14.6925C17.2406 14.3726 17.4029 13.9495 17.3952 13.5123C17.3874 13.0751 17.2103 12.658 16.9012 12.3489C16.592 12.0397 16.1749 11.8626 15.7377 11.8549C15.3005 11.8471 14.8774 12.0094 14.5575 12.3075L10.0575 16.8075C9.7415 17.1239 9.564 17.5528 9.564 18C9.564 18.4472 9.7415 18.8761 10.0575 19.1925L14.5575 23.6925C14.712 23.8583 14.8983 23.9913 15.1053 24.0835C15.3123 24.1757 15.5358 24.2253 15.7623 24.2293C15.9889 24.2333 16.214 24.1917 16.4241 24.1068C16.6342 24.0219 16.8251 23.8956 16.9853 23.7353C17.1456 23.5751 17.2719 23.3842 17.3568 23.1741C17.4417 22.964 17.4833 22.7389 17.4793 22.5123C17.4753 22.2857 17.4257 22.0623 17.3335 21.8553C17.2413 21.6483 17.1083 21.462 16.9425 21.3075L15.3225 19.6875H38.25C38.6976 19.6875 39.1268 19.5097 39.4433 19.1932C39.7597 18.8768 39.9375 18.4476 39.9375 18C39.9375 17.5524 39.7597 17.1232 39.4433 16.8068C39.1268 16.4903 38.6976 16.3125 38.25 16.3125H15.3225L16.9425 14.6925ZM37.0575 30.3075C36.7415 30.6239 36.564 31.0528 36.564 31.5C36.564 31.9472 36.7415 32.3761 37.0575 32.6925L38.6775 34.3125H15.75C15.3025 34.3125 14.8732 34.4903 14.5568 34.8068C14.2403 35.1232 14.0625 35.5524 14.0625 36C14.0625 36.4476 14.2403 36.8768 14.5568 37.1932C14.8732 37.5097 15.3025 37.6875 15.75 37.6875H38.6775L37.0575 39.3075C36.8917 39.462 36.7587 39.6483 36.6665 39.8553C36.5743 40.0623 36.5247 40.2857 36.5207 40.5123C36.5167 40.7389 36.5584 40.964 36.6432 41.1741C36.7281 41.3842 36.8544 41.5751 37.0147 41.7353C37.1749 41.8956 37.3658 42.0219 37.5759 42.1068C37.786 42.1917 38.0111 42.2333 38.2377 42.2293C38.4643 42.2253 38.6877 42.1757 38.8947 42.0835C39.1017 41.9913 39.288 41.8583 39.4425 41.6925L43.9425 37.1925C44.2585 36.8761 44.436 36.4472 44.436 36C44.436 35.5528 44.2585 35.1239 43.9425 34.8075L39.4425 30.3075C39.1261 29.9915 38.6972 29.814 38.25 29.814C37.8028 29.814 37.3739 29.9915 37.0575 30.3075Z"
      fill="currentColor"
    />
  </svg>
);

const Dashboard = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM14 21H20C20.55 21 21 20.55 21 20V12C21 11.45 20.55 11 20 11H14C13.45 11 13 11.45 13 12V20C13 20.55 13.45 21 14 21ZM13 4V8C13 8.55 13.45 9 14 9H20C20.55 9 21 8.55 21 8V4C21 3.45 20.55 3 20 3H14C13.45 3 13 3.45 13 4Z"
      fill="currentColor"
    />
  </svg>
);

const icn2 = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_3_4)">
      <path
        d="M12.356 12.388L14.877 5.25H18.517L12.382 20.343H8.539L10.294 16.207L6 5.25H9.717L12.356 12.388ZM12 0C5.381 0 0 5.381 0 12C0 18.619 5.381 24 12 24C18.619 24 24 18.619 24 12C24 5.381 18.619 0 12 0ZM12 1.5C17.808 1.5 22.5 6.192 22.5 12C22.5 17.808 17.808 22.5 12 22.5C6.192 22.5 1.5 17.808 1.5 12C1.5 6.192 6.192 1.5 12 1.5Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_3_4">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const icn3 = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.6906 7.22813C14.6906 7.22813 14.9281 8.39062 14.9812 8.63437H13.9375C14.0406 8.35625 14.4375 7.275 14.4375 7.275C14.4312 7.28438 14.5406 6.99062 14.6031 6.80937L14.6906 7.22813ZM18 2.5V13.5C18 14.3281 17.3281 15 16.5 15H1.5C0.671875 15 0 14.3281 0 13.5V2.5C0 1.67188 0.671875 1 1.5 1H16.5C17.3281 1 18 1.67188 18 2.5ZM4.76562 10.35L6.74062 5.5H5.4125L4.18437 8.8125L4.05 8.14062L3.6125 5.90938C3.54062 5.6 3.31875 5.5125 3.04375 5.5H1.02188L1 5.59688C1.49375 5.72188 1.93437 5.90312 2.31875 6.13125L3.4375 10.35H4.76562ZM7.71562 10.3562L8.50313 5.5H7.24687L6.4625 10.3562H7.71562ZM12.0875 8.76875C12.0937 8.21563 11.7563 7.79375 11.0344 7.44688C10.5938 7.225 10.325 7.075 10.325 6.84688C10.3312 6.64063 10.5531 6.42812 11.0469 6.42812C11.4563 6.41875 11.7562 6.51563 11.9812 6.6125L12.0938 6.66563L12.2656 5.61562C12.0187 5.51875 11.625 5.40938 11.1406 5.40938C9.9 5.40938 9.02813 6.07187 9.02188 7.01562C9.0125 7.7125 9.64687 8.1 10.1219 8.33438C10.6062 8.57188 10.7719 8.72813 10.7719 8.9375C10.7656 9.2625 10.3781 9.4125 10.0188 9.4125C9.51875 9.4125 9.25 9.33437 8.84062 9.15312L8.675 9.075L8.5 10.1656C8.79375 10.3 9.3375 10.4188 9.9 10.425C11.2187 10.4281 12.0781 9.775 12.0875 8.76875ZM16.5 10.3562L15.4875 5.5H14.5156C14.2156 5.5 13.9875 5.5875 13.8594 5.90312L11.9937 10.3562H13.3125C13.3125 10.3562 13.5281 9.75625 13.575 9.62813H15.1875C15.225 9.8 15.3375 10.3562 15.3375 10.3562H16.5Z"
      fill="currentColor"
    />
  </svg>
);

const icn4 = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.5 1L2 6V8H21V6M16 10V17H19V10M2 22H21V19H2M10 10V17H13V10M4 10V17H7V10H4Z"
      fill="currentColor"
    />
  </svg>
);

const icn5 = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_3_10)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0 1.75C0 0.784 0.784 0 1.75 0H12.25C13.216 0 14 0.783 14 1.75V5.007C13.9994 6.99717 13.3611 8.93479 12.1787 10.5356C10.9963 12.1365 9.33203 13.3163 7.43 13.902C7.14993 13.989 6.85007 13.989 6.57 13.902C4.66797 13.3163 3.00369 12.1365 1.82128 10.5356C0.638874 8.93479 0.000570406 6.99717 0 5.007L0 1.75ZM7 6.5C7.59674 6.5 8.16903 6.26295 8.59099 5.84099C9.01295 5.41903 9.25 4.84674 9.25 4.25C9.25 3.65326 9.01295 3.08097 8.59099 2.65901C8.16903 2.23705 7.59674 2 7 2C6.40326 2 5.83097 2.23705 5.40901 2.65901C4.98705 3.08097 4.75 3.65326 4.75 4.25C4.75 4.84674 4.98705 5.41903 5.40901 5.84099C5.83097 6.26295 6.40326 6.5 7 6.5ZM11.152 9.393C10.6357 8.7987 9.99788 8.32217 9.28158 7.99559C8.56529 7.66901 7.78723 7.50001 7 7.5C6.21277 7.50001 5.43471 7.66901 4.71842 7.99559C4.00212 8.32217 3.36428 8.7987 2.848 9.393C3.84297 10.8588 5.30729 11.9422 7 12.465C8.69271 11.9422 10.157 10.8588 11.152 9.393Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_3_10">
        <rect width="14" height="14" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const icn6 = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 11.78L20.24 4.45L21.97 5.45L16.74 14.5L10.23 10.75L5.46 19H22V21H2V3H4V17.54L9.5 8L16 11.78Z"
      fill="currentColor"
    />
  </svg>
);

const icn7 = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23 12L20.56 9.22L20.9 5.54L17.29 4.72L15.4 1.54L12 3L8.6 1.54L6.71 4.72L3.1 5.53L3.44 9.21L1 12L3.44 14.78L3.1 18.47L6.71 19.29L8.6 22.47L12 21L15.4 22.46L17.29 19.28L20.9 18.46L20.56 14.78L23 12ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z"
      fill="currentColor"
    />
  </svg>
);

const icn8 = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 20H19V18H5V20ZM19 9H15V3H9V9H5L12 16L19 9Z"
      fill="currentColor"
    />
  </svg>
);

const icn9 = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M10 4C9.20435 4 8.44129 4.31607 7.87868 4.87868C7.31607 5.44129 7 6.20435 7 7H4C3.46957 7 2.96086 7.21071 2.58579 7.58579C2.21071 7.96086 2 8.46957 2 9V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V9C22 8.46957 21.7893 7.96086 21.4142 7.58579C21.0391 7.21071 20.5304 7 20 7H17C17 6.20435 16.6839 5.44129 16.1213 4.87868C15.5587 4.31607 14.7956 4 14 4H10ZM10 6C9.73478 6 9.48043 6.10536 9.29289 6.29289C9.10536 6.48043 9 6.73478 9 7H15C15 6.73478 14.8946 6.48043 14.7071 6.29289C14.5196 6.10536 14.2652 6 14 6H10ZM4 13C3.73478 13 3.48043 13.1054 3.29289 13.2929C3.10536 13.4804 3 13.7348 3 14C3 14.2652 3.10536 14.5196 3.29289 14.7071C3.48043 14.8946 3.73478 15 4 15H20C20.2652 15 20.5196 14.8946 20.7071 14.7071C20.8946 14.5196 21 14.2652 21 14C21 13.7348 20.8946 13.4804 20.7071 13.2929C20.5196 13.1054 20.2652 13 20 13H4Z"
      fill="currentColor"
    />
  </svg>
);

const icn10 = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V7H2V9H4V11H2V13H4V15H2V17H4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H21C21.2652 22 21.5196 21.8946 21.7071 21.7071C21.8946 21.5196 22 21.2652 22 21V3C22 2.73478 21.8946 2.48043 21.7071 2.29289C21.5196 2.10536 21.2652 2 21 2ZM13 4.999C14.648 4.999 16 6.35 16 7.999C15.9976 8.79401 15.6808 9.5558 15.1188 10.1181C14.5567 10.6803 13.795 10.9974 13 11C11.353 11 10 9.647 10 7.999C10 6.35 11.353 4.999 13 4.999ZM19 18H7V17.25C7 15.031 9.705 12.75 13 12.75C16.295 12.75 19 15.031 19 17.25V18Z"
      fill="currentColor"
    />
  </svg>
);

const close = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 13.4L7.09999 18.3C6.91665 18.4833 6.68332 18.575 6.39999 18.575C6.11665 18.575 5.88332 18.4833 5.69999 18.3C5.51665 18.1167 5.42499 17.8833 5.42499 17.6C5.42499 17.3167 5.51665 17.0833 5.69999 16.9L10.6 12L5.69999 7.09999C5.51665 6.91665 5.42499 6.68332 5.42499 6.39999C5.42499 6.11665 5.51665 5.88332 5.69999 5.69999C5.88332 5.51665 6.11665 5.42499 6.39999 5.42499C6.68332 5.42499 6.91665 5.51665 7.09999 5.69999L12 10.6L16.9 5.69999C17.0833 5.51665 17.3167 5.42499 17.6 5.42499C17.8833 5.42499 18.1167 5.51665 18.3 5.69999C18.4833 5.88332 18.575 6.11665 18.575 6.39999C18.575 6.68332 18.4833 6.91665 18.3 7.09999L13.4 12L18.3 16.9C18.4833 17.0833 18.575 17.3167 18.575 17.6C18.575 17.8833 18.4833 18.1167 18.3 18.3C18.1167 18.4833 17.8833 18.575 17.6 18.575C17.3167 18.575 17.0833 18.4833 16.9 18.3L12 13.4Z"
      fill="currentColor"
    />
  </svg>
);
