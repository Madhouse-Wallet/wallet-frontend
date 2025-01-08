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
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="23"
            viewBox="0 0 22 23"
            fill="none"
          >
            <path
              d="M10.9974 18.8332V11.4998M10.9974 11.4998V4.1665M10.9974 11.4998H18.3307M10.9974 11.4998H3.66406"
              stroke="#C0C0C0"
              stroke-width="1.375"
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
