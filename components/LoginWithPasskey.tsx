import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { PasskeyArgType } from "@safe-global/protocol-kit";
import { loadPasskeysFromLocalStorage } from "../lib/passkeys";
import { Col, Container, Row } from "react-bootstrap";
import styled from "styled-components";

type props = {
  handleCreatePasskey: () => {};
  handleSelectPasskey: (passkey: PasskeyArgType) => {};
};

function LoginWithPasskey({ handleCreatePasskey, handleSelectPasskey }: props) {
  return (
    <>
      <section
        className={` authLayout position-relative d-flex align-items-center justify-content-center flex-column`}
        style={{
          zIndex: "9",
          // height: "100vh",
        }}
      >
        <Container className="px-0">
          <Row className="justify-content-center">
            <Col md="12" className="">
              <FormWrpper
                className={` position-relative p-3 py-lg-5`}
                style={{ maxHeight: "85vh", background: "#1e1e1e" }}
              >
                <div className="formInner position-relative px-lg-3">
                  <div className="w-100 inner text-center">
                    <h2 className="m-0 fw-bold themeClr pb-3 pb-lg-4">
                      Use Safe Account via Passkeys
                    </h2>
                    <h5 className="m-0 text-white py-3 py-lg-4">
                      Create a new Safe using passkeys
                    </h5>
                    <div className="py-3 py-lg-4 btnWrpper">
                      <Button
                        onClick={handleCreatePasskey}
                        className="d-flex align-items-center justify-content-center commonBtn w-100 borderedBtn"
                      >
                        <span className="icn me-1">
                          <FingerprintIcon />
                        </span>
                        Create a new Passkey
                      </Button>
                    </div>
                    <Divider sx={{ marginTop: "32px" }}>
                      <Typography variant="caption" color="GrayText">
                        OR
                      </Typography>
                    </Divider>
                    <h5 className="m-0 text-white py-3 py-lg-4">
                      Connect existing Safe using an existing passkey
                    </h5>
                    <div className="pt-3 pt-lg-4 btnWrpper">
                      <Button
                        onClick={async () => {
                          const passkeys = loadPasskeysFromLocalStorage();

                          handleSelectPasskey(passkeys[0]);
                        }}
                        // onClick={() => navigate('/dashboard')}
                        className="d-flex align-items-center justify-content-center commonBtn w-100"
                      >
                        <span className="icn me-1">
                          <FingerprintIcon />
                        </span>
                        Use an Existing passkey
                      </Button>
                    </div>
                  </div>
                </div>
              </FormWrpper>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}

const FormWrpper = styled.div`
  border-radius: 10px;
  box-shadow: 1px 1px 3.8px 2px rgba(0, 0, 0, 0.15);
  overflow: auto;
  scrollbar-width: none;
  color: #fff;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export default LoginWithPasskey;
