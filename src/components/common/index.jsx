import { useEffect, useRef, useState } from "react";
import { AccordionIcon, CstmDropdown } from "./commonStyled";
import { useRouter } from "next/navigation";
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
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.9999 25.3369V12.6631"
              stroke="#999999"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M25.3368 19H12.6631"
              stroke="#999999"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
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

export const BackBtn = () => {
  const router = useRouter();
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };
  return (
    <>
      <button onClick={handleGoBack} className="border-0 themeClr p-0">
        {backIcn}
      </button>
    </>
  );
};

export const RadioToggle = ({ runfunc, initValueAutoTransfer }) => {
  console.log("initValueAutoTransfer-->",initValueAutoTransfer)
  const [enabled, setEnabled] = useState(initValueAutoTransfer);

  return (
    <div
      className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${enabled ? 'bg-[#df723b]' : 'bg-gray-300'
        }`}
      onClick={() => { setEnabled(!enabled); runfunc(!enabled) }}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-4' : 'translate-x-0'
          }`}
      />
    </div>
  );
}

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
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
