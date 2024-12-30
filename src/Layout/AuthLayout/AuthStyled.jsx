import styled from "styled-components";

export const InputWrp = styled.div`
  input {
    height: 50px !important;
    background: rgba(0, 0, 0, 0.25) !important;
    border: 1px solid #3b3b3b !important;
    border-radius: 8px;
    color: #fff !important;
    font-size: 14px;
    width: 100% !important;
    &::placeholder {
      color: #64646f;
    }
  }
`;

export const FormWrpper = styled.div`
z-index: 9
  &:after {
    border-radius: 24px;
    position: absolute;
    content: "";
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    border: 1px solid #4cafff;
    z-index: -1;
    opacity: 0.3;
  }
  .inner {
    background: rgba(255, 255, 255, 0.03);
    box-shadow: 0px 4px 7.7px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(61.25px);
    /* Note: backdrop-filter has minimal browser support */
    border-radius: 24px;
  }

  @media (max-width: 575px) {
    &:after {
      border-radius: 10px;
    }
    .inner {
      border-radius: 10px;
    }
  }
`;
