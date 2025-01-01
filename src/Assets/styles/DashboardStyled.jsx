import styled from "styled-components";

export const CardCstm = styled.div`
  background-color: var(--cardBg);
  border: 1px solid #ff8735;
  font-size: 14px;
  line-height: 20px;
`;

export const GreyBtn = styled.button`
  height: 35px;
  background: #404040;
  border-color: #404040;
  font-size: 12px;
  &:hover {
    background: #76fc93;
    border-color: #76fc93;
    color: #000;
  }
`;
