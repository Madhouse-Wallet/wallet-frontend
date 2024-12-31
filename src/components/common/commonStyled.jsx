import styled, { keyframes } from "styled-components";

export const CstmDropdown = styled.div`
  .dropdownMenu {
    min-width: ${({ width }) => (width ? width : "200px")};
    z-index: 9;
    background: #211f1f;
    border: 1px solid #27282e;
    box-shadow: 3px 4px 3px rgba(0, 0, 0, 0.25);
    border-radius: 18px;
    * {
      border-color: #27282e;
    }
  }
`;

export const AccordionWrapper = styled.div``;

export const AccordionButton = styled.button`
  width: 100%;
  position: relative;
  padding: 10px;
  background-color: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.active {
    .accordionIcn {
      top: 50%;
      / Uncomment to rotate the icon when active /
      / transform: translateY(-50%) rotate(-180deg); /
    }
  }
`;

export const AccordionIcon = styled.span`
  position: absolute;
  right: 2px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  transition: 0.4s;
  top: 50%;
  transform: translateY(-50%);
`;

export const AccordionBody = styled.div`
  padding: 2px 0;
  position: relative;
`;
