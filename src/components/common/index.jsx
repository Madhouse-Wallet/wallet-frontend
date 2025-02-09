import { useState, useEffect, useRef } from "react";
// import styles from "./Common.module.scss";
import { AccordionIcon, CstmDropdown } from "./commonStyled";
import { useRouter } from "next/router";
import { AccordionWrapper } from "./commonStyled";
import { AccordionButton } from "./commonStyled";
import { AccordionBody } from "./commonStyled";

// accordion item
export const AccordionItem = ({
  title,
  children,
  btnClass,
  svg,
  btnIcnClass,
  isOpen,
  onClick,
  wrpperClass,
}) => {
  return (
    <AccordionWrapper className={`${wrpperClass}`}>
      <AccordionButton
        className={`${btnClass} ${isOpen && "active"}`}
        onClick={onClick}
      >
        {svg && <span className={`${btnIcnClass}`}>{svg}</span>}
        <span>{title}</span>
        <AccordionIcon className="accordionIcn">
          <svg
            width="24"
            height="24"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.2503 34.8332H23.7503C31.667 34.8332 34.8337 31.6665 34.8337 23.7498V14.2498C34.8337 6.33317 31.667 3.1665 23.7503 3.1665H14.2503C6.33366 3.1665 3.16699 6.33317 3.16699 14.2498V23.7498C3.16699 31.6665 6.33366 34.8332 14.2503 34.8332Z"
              fill=""
              stroke="#999999"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M18.9999 25.3369V12.6631"
              stroke="#999999"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M25.3368 19H12.6631"
              stroke="#999999"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </AccordionIcon>
      </AccordionButton>
      {isOpen && <AccordionBody className="py-2">{children}</AccordionBody>}
    </AccordionWrapper>
  );
};
// dropdown
export const Dropdown = ({
  drpButtonContent,
  isOpen,
  onClick,
  btnClass,
  dropdownMenuClass,
  children,
  width,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClick(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClick]);

  return (
    <CstmDropdown className={` relative flex-shrink-0`} ref={dropdownRef}>
      <button onClick={() => onClick(!isOpen)} className={`${btnClass}`}>
        {drpButtonContent}
      </button>
      {isOpen && (
        <div
          style={{ minWidth: width || "200px" }}
          className={`${dropdownMenuClass} dropdownMenu absolute mt-2 `}
        >
          {children}
        </div>
      )}
    </CstmDropdown>
  );
};
