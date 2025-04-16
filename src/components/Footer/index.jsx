import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";
import bg from "@/Assets/Images/bg1.png";
import Link from "next/link";
import styled from "styled-components";
import { useRouter } from "next/router";
import { Tooltip } from "react-tooltip";
import { createPortal } from "react-dom";
import PointOfSalePop from "@/components/Modals/PointOfSalePop";

const Footer = () => {
  const router = useRouter();
  const [pointSale, setPointSale] = useState();

  return (
    <>
      {pointSale &&
        createPortal(
          <PointOfSalePop pointSale={pointSale} setPointSale={setPointSale} />,
          document.body
        )}
      <FooterDiv className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 pb-3">
        {/* <Image
          src={bg}
          alt="graphic"
          height={1000}
          width={1000}
          className="max-w-full max-h-full absolute w-100  bottom-0 left-0 h-auto  opacity-30 object-cover right-0 z-[-1]"
        /> */}
        {/* <Tooltip
          id="my-tooltip"
          style={{
            background: "var(--textColor2)",
            backdropFilter: "blur(12.8px)",
            borderRadius: 30,
            fontSize: 12,
            color: "var(--backgroundColor2)",
          }}
        /> */}
        <FootNav className="mx-auto flex items-end gap-4 rounded-2xl bg-black/50 contrast-more:bg-neutral-700 backdrop-blur-2xl contrast-more:backdrop-blur-none px-3 shadow-dock shrink-0 will-change-transform transform-gpu border-hpx border-white/10">
          <li className="relative aspect-square">
            <Link
              data-tooltip-id="my-tooltip"
              data-tooltip-content="home"
              href={"/dashboard"}
              className="relative origin-top-center bg-cover transition-[filter] has-[:focus-visible]:brightness-125"
            >
              <Image
                src={process.env.NEXT_PUBLIC_IMAGE_URL + "dock-home.png"}
                height={1000}
                width={1000}
                className="max-w-full w-auto mx-auto"
                alt=""
                style={{ height: 42 }}
              />
              <span className=" font-medium block text-center text-white/50">
                Home
              </span>
            </Link>
            {/* <div
              className="absolute -bottom-[7px] left-1/2 h-[2px] w-[10px] -translate-x-1/2 rounded-full bg-white"
              style={{ opacity: 1 }}
            ></div> */}
          </li>
          {/* <li className="relative aspect-square">
            <button
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Approval"
              href={"/point-of-sale"}
              onClick={() => setPointSale(!pointSale)}
              className="relative origin-top-center bg-cover transition-[filter] has-[:focus-visible]:brightness-125"
            >
              <Image
                src={process.env.NEXT_PUBLIC_IMAGE_URL + "dock-app-store.png"}
                height={1000}
                width={1000}
                className="max-w-full w-auto mx-auto"
                alt=""
                style={{ height: 42 }}
              />
              <span className=" font-medium block text-center text-white/50">
                Point of Sale
              </span>
            </button>
          </li> */}
          {/* <li>
                  <Link href={"/approval"} className="relative inline-block">
                    <Image
                      src={b3}
                      height={1000}
                      width={1000}
                      className="max-w-full w-auto mx-auto"
                      alt=""
                      style={{ height: 42 }}
                    />
                  </Link>
                </li> */}
          <li className="relative aspect-square">
            <Link
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Setting"
              href={"/setting"}
              // onClick={() => setSettingPop(!settingPop)}
              className="relative origin-top-center bg-cover transition-[filter] has-[:focus-visible]:brightness-125"
            >
              <Image
                src={process.env.NEXT_PUBLIC_IMAGE_URL + "dock-settings.png"}
                height={1000}
                width={1000}
                className="max-w-full w-auto mx-auto"
                alt=""
                style={{ height: 42 }}
              />
              <span className=" font-medium block text-center text-white/50">
                Settings
              </span>
            </Link>
          </li>
          <li className="relative aspect-square">
            <Link
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Content Pages"
              href={"/content-page"}
              // onClick={() => setContentPop(!contentPop)}
              className="relative origin-top-center bg-cover transition-[filter] has-[:focus-visible]:brightness-125"
            >
              <Image
                src={process.env.NEXT_PUBLIC_IMAGE_URL + "dock-widgets.png"}
                height={1000}
                width={1000}
                className="max-w-full w-auto mx-auto"
                alt=""
                style={{ height: 42 }}
              />
              <span className=" font-medium block text-center text-white/50">
                Docs
              </span>
            </Link>
          </li>
        </FootNav>
      </FooterDiv>
    </>
  );
};
const FooterDiv = styled.footer`
  font-family: "Funnel Display", serif;
  width: 100%;
  max-width: max-content;
`;
const FootNav = styled.ul`
  opacity: 1;
  transform: none;
  li {
    padding: 5px 0;
    flex-shrink: 0;
  }
  a,
  button {
    transition: 0.4s;
    display: block;
    img {
      transition: 0.4s;
    }
    span {
      font-size: 10px;
    }
    ${
      "" /* svg {
      height: 28px;
      width: 28px;
    } */
    }
    &:hover {
      img {
        transform: translateY(-18px) scale(1.3);
      }
    }
  }
  @media (max-width: 767px) {
    a {
      ${
        "" /* height: 35px;
      width: 35px;
      border-radius: 5px !important; */
      }
      svg {
        height: 18px;
        width: 18px;
      }
    }
  }
`;
export default Footer;

const icn1 = (
  <svg
    width="33"
    height="34"
    viewBox="0 0 33 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M29.8467 18.1164V12.6898C29.8467 5.90645 27.1334 3.19312 20.35 3.19312H12.21C5.42671 3.19312 2.71338 5.90645 2.71338 12.6898V20.8298C2.71338 27.6131 5.42671 30.3264 12.21 30.3264H17.6367"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.94434 20.1381L13.1732 15.9459C13.6345 15.349 14.4892 15.2405 15.0861 15.7017L17.5688 17.6553C18.1658 18.1166 19.0204 18.0081 19.4817 17.4247L22.6156 13.3818"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M26.4281 21.9423L26.8079 22.7156C26.9978 23.0955 27.4727 23.4482 27.8932 23.5296L28.4088 23.611C29.9554 23.8688 30.3217 25.0084 29.2092 26.1344L28.7344 26.6092C28.4223 26.9348 28.246 27.5589 28.341 27.993L28.4088 28.278C28.8293 30.1502 27.839 30.8692 26.211 29.8924L25.8582 29.6889C25.4377 29.4447 24.7593 29.4447 24.3388 29.6889L23.986 29.8924C22.3445 30.8827 21.3541 30.1502 21.7882 28.278L21.856 27.993C21.951 27.5589 21.7747 26.9348 21.4626 26.6092L20.9878 26.1344C19.8753 25.0084 20.2416 23.8688 21.7882 23.611L22.3038 23.5296C22.7108 23.4618 23.1992 23.0955 23.3891 22.7156L23.769 21.9423C24.5016 20.4636 25.6955 20.4636 26.4281 21.9423Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const icn2 = (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.95996 12.5801H19.24"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M8.87988 24.4199H11.8399"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M15.54 24.4199H21.46"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M32.56 16.7684V23.8427C32.56 29.0375 31.2428 30.3399 25.9888 30.3399H9.53116C4.27716 30.3399 2.95996 29.0375 2.95996 23.8427V11.6772C2.95996 6.48235 4.27716 5.17993 9.53116 5.17993H19.6544"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M25.1602 4.81006H29.7926C30.8138 4.81006 31.6426 5.74246 31.6426 6.66006C31.6426 7.68126 30.8138 8.51006 29.7926 8.51006H25.1602V4.81006Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M25.1602 8.51001H30.4438C31.613 8.51001 32.5602 9.33881 32.5602 10.36C32.5602 11.3812 31.613 12.21 30.4438 12.21H25.1602V8.51001Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M27.7651 12.21V14.06"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M27.7651 2.95996V4.80996"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M26.9214 4.81006H23.6802"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M26.9214 12.21H23.6802"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const icn3 = (
  <svg
    width="36"
    height="37"
    viewBox="0 0 36 37"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.557 16.7578C13.409 16.7424 13.2314 16.7424 13.0686 16.7578C9.54622 16.6345 6.74902 13.6283 6.74902 9.92825C6.74902 6.15117 9.67942 3.08325 13.3202 3.08325C16.9462 3.08325 19.8914 6.15117 19.8914 9.92825C19.8766 13.6283 17.0794 16.6345 13.557 16.7578Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M24.2866 6.16675C27.1578 6.16675 29.4666 8.58716 29.4666 11.5626C29.4666 14.4763 27.2466 16.8505 24.479 16.9584C24.3606 16.943 24.2274 16.943 24.0942 16.9584"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M6.1569 22.4467C2.5753 24.9442 2.5753 29.0142 6.1569 31.4963C10.2269 34.333 16.9017 34.333 20.9717 31.4963C24.5533 28.9988 24.5533 24.9288 20.9717 22.4467C16.9165 19.6255 10.2417 19.6255 6.1569 22.4467Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M27.1431 30.8333C28.2087 30.602 29.2151 30.1549 30.0439 29.492C32.3527 27.6883 32.3527 24.7128 30.0439 22.9091C29.2299 22.2616 28.2383 21.8299 27.1875 21.5833"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const icn4 = (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.32 32.56H22.2C29.6 32.56 32.56 29.6 32.56 22.2V13.32C32.56 5.91996 29.6 2.95996 22.2 2.95996H13.32C5.91996 2.95996 2.95996 5.91996 2.95996 13.32V22.2C2.95996 29.6 5.91996 32.56 13.32 32.56Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M25.9001 17.7601C25.9001 22.2593 22.2593 25.9001 17.7601 25.9001C13.2609 25.9001 10.5229 21.3713 10.5229 21.3713M10.5229 21.3713H14.1933M10.5229 21.3713V25.4413M9.62012 17.7601C9.62012 13.2609 13.2313 9.62012 17.7601 9.62012C23.1917 9.62012 25.9001 14.1489 25.9001 14.1489M25.9001 14.1489V10.0789M25.9001 14.1489H22.2889"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const icn5 = (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.8398 2.95996V7.39996"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M23.6802 2.95996V7.39996"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M31.0799 12.5799V25.1599C31.0799 29.5999 28.8599 32.5599 23.6799 32.5599H11.8399C6.65994 32.5599 4.43994 29.5999 4.43994 25.1599V12.5799C4.43994 8.13993 6.65994 5.17993 11.8399 5.17993H23.6799C28.8599 5.17993 31.0799 8.13993 31.0799 12.5799Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M11.8398 16.28H23.6798"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M11.8398 23.6799H17.7598"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const icn6 = (
  <svg
    width="36"
    height="37"
    viewBox="0 0 36 37"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M32.56 20.0416V13.8749C32.56 6.16659 29.6 3.08325 22.2 3.08325H13.32C5.91996 3.08325 2.95996 6.16659 2.95996 13.8749V23.1249C2.95996 30.8333 5.91996 33.9166 13.32 33.9166H19.24"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M32.56 20.0416V13.8749C32.56 6.16659 29.6 3.08325 22.2 3.08325H13.32C5.91996 3.08325 2.95996 6.16659 2.95996 13.8749V23.1249C2.95996 30.8333 5.91996 33.9166 13.32 33.9166H19.24"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M32.56 20.0416V13.8749C32.56 6.16659 29.6 3.08325 22.2 3.08325H13.32C5.91996 3.08325 2.95996 6.16659 2.95996 13.8749V23.1249C2.95996 30.8333 5.91996 33.9166 13.32 33.9166H19.24"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M23.6802 29.9545L26.0186 32.3749L31.0802 26.2083"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M10.3599 16.1875V20.8125"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M17.7598 16.1875V20.8125"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M25.1602 16.1875V20.8125"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const icn7 = (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.45459 16.6055V23.2507C4.45459 29.8959 7.11859 32.5599 13.7638 32.5599H21.741C28.3862 32.5599 31.0502 29.8959 31.0502 23.2507V16.6055"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M17.7602 17.76C20.4686 17.76 22.4666 15.5548 22.2002 12.8464L21.2234 2.95996H14.3118L13.3202 12.8464C13.0538 15.5548 15.0518 17.76 17.7602 17.76Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M27.0989 17.76C30.0885 17.76 32.2789 15.3328 31.9829 12.358L31.5685 8.28796C31.0357 4.43996 29.5557 2.95996 25.6781 2.95996H21.1641L22.2001 13.3348C22.4517 15.7768 24.6569 17.76 27.0989 17.76Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M8.34732 17.76C10.7893 17.76 12.9945 15.7768 13.2313 13.3348L13.5569 10.064L14.2673 2.95996H9.75332C5.87572 2.95996 4.39572 4.43996 3.86292 8.28796L3.46332 12.358C3.16732 15.3328 5.35772 17.76 8.34732 17.76Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M17.7601 25.1599C15.2885 25.1599 14.0601 26.3883 14.0601 28.8599V32.5599H21.4601V28.8599C21.4601 26.3883 20.2317 25.1599 17.7601 25.1599Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
