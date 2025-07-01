import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSet } from "../../../lib/redux/slices/auth/authSlice";
import { generateOTP } from "../../../utils/globals";
import Image from "next/image";
const LoginPop = ({ login, setLogin }) => {
  const dispatch = useDispatch();
  const [registerEmail, setRegisterEmail] = useState();
  const [registerUsername, setRegisterUsername] = useState();
  const [registerOTP, setRegisterOTP] = useState();
  const [checkOTP, setCheckOTP] = useState();
  const [registerTab, setRegisterTab] = useState(1);

  const [loginEmail, setLoginEmail] = useState();

  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerOtpLoading, setRegisterOtpLoading] = useState(false);
  async function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  }

  const addUser = async (
    email,
    username,
    passkey,
    publickeyId,
    rawId,
    wallet
  ) => {
    try {
      try {
        return await fetch(`/api/add-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            username,
            passkey,
            publickeyId,
            rawId,
            wallet,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            return data;
          });
      } catch (error) {
        console.log(error);
        return false;
      }
    } catch (error) {
      console.log("error-->", error);
      return false;
    }
  };
  const getUser = async (email) => {
    try {
      try {
        return await fetch(`/api/get-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            return data;
          });
      } catch (error) {
        console.log(error);
        return false;
      }
    } catch (error) {
      console.log("error-->", error);
      return false;
    }
  };

  const sendOTP = async ({ email, name, otp, subject, type }) => {
    try {
      return await fetch(`/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject,
          emailData: {
            name: name,
            verificationCode: otp,
          },
          email,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          return data;
        });
    } catch (error) {
      console.log("error-->", error);
      return false;
    }
  };
  const loginFn = async () => {
    try {
      setLoginLoading(true);
      if (!loginEmail) {
        return;
      } else {
        let validEmail = await isValidEmail(loginEmail);
        if (!validEmail) {
          setLoginLoading(false);
          return;
        }
        let userExist = await getUser(loginEmail);
        if (userExist.status && userExist.status == "failure") {
          rerurn;
        } else {
          const authenticated = false;
          if (authenticated) {
            let account = false;
            if (account) {
              // toast.success("Login Successfully!");
              dispatch(
                loginSet({
                  login: true,
                  walletAddress: account?.account?.address || "",
                  bitcoinWallet: userExist.userId.bitcoinWallet || "",
                  username: userExist.userId.username || "",
                  email: userExist.userId.email,
                  passkeyCred: userExist.userId.passkey || "",
                  multisigAddress: userExist.userId.multisigAddress || "",
                  ensName: userExist.userId.ensName || "",
                  ensSetup: userExist.userId.ensSetup || false,
                  passkey2: userExist.userId.passkey2 || "",
                  passkey3: userExist.userId.passkey3 || "",
                  multisigSetup: userExist.userId.multisigSetup || false,
                  multisigActivate: userExist.userId.multisigActivate || false,
                })
              );
              setLoginEmail();
              handleLogin();
            } else {
              return;
            }
          } else {
            return;
          }
        }
      }
      setLoginLoading(false);
    } catch (error) {
      setLoginLoading(false);
      console.log("error---->", error);
    }
  };

  const registerFn = async () => {
    try {
      setRegisterLoading(true);
      if (!registerOTP) {
        return;
      } else if (registerOTP != checkOTP) {
        return;
      } else {
        let userExist = await getUser(registerEmail);
        if (userExist.status && userExist.status == "success") {
          return;
        }
        const createdCredential = false;
        if (createdCredential) {
          let account = false;
          let data = await addUser(
            registerEmail,
            registerUsername,
            createdCredential,
            createdCredential.publicKey,
            createdCredential.id,
            account?.account?.address
          );
          toast.success("Sign Up Successfully!");
          setRegisterTab(2);
          dispatch(
            loginSet({
              login: true,
              walletAddress: account?.account?.address || "",
              bitcoinWallet: data.userData.bitcoinWallet || "",
              username: registerUsername,
              email: registerEmail,
              passkeyCred: createdCredential || "",
              multisigAddress: data.userData.multisigAddress || "",
              passkey2: data.userData.passkey2 || "",
              passkey3: data.userData.passkey3 || "",
              ensName: data.userData.ensName || "",
              ensSetup: data.userData.ensSetup || false,
              multisigSetup: data.userData.multisigSetup || false,
              multisigActivate: data.userData.multisigActivate || false,
            })
          );
          setRegisterEmail();
          setRegisterUsername();
          handleLogin();
        }
      }
      setRegisterLoading(false);
    } catch (error) {
      console.log("error---->", error);
      setRegisterLoading(false);
    }
  };

  const sendRegisterOtp = async () => {
    try {
      setRegisterOtpLoading(true);
      if (!registerEmail) {
        return;
      } else if (!registerUsername) {
        return;
      } else {
        let validEmail = await isValidEmail(registerEmail);
        if (!validEmail) {
          setRegisterOtpLoading(false);
          return;
        }
        let userExist = await getUser(registerEmail);
        if (userExist.status && userExist.status == "success") {
          return;
        } else {
          let OTP = generateOTP(4);
          setCheckOTP(OTP);
          let obj = {
            email: registerEmail,
            name: registerUsername,
            otp: OTP,
            subject: "Madhouse Account Verification OTP",
            type: "registerOtp",
          };
          let sendEmailData = await sendOTP(obj);
          if (sendEmailData.status && sendEmailData.status == "success") {
            setRegisterTab(2);
            toast.success(sendEmailData?.message);
          } else {
            return;
          }
        }
      }
      setRegisterOtpLoading(false);
    } catch (error) {
      console.log("error---->", error);
      setRegisterOtpLoading(false);
    }
  };
  const tabs = [
    {
      title: "Login",
      content: (
        <>
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <label htmlFor="" className="form-label m-0 font-medium text-xs">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="form-control bg-[var(--backgroundColor2)] border-gray-600 focus:bg-[var(--backgroundColor2)] focus:border-gray-600 text-xs"
              />
            </div>
            <div className="col-span-12">
              <button
                disabled={loginLoading}
                onClick={loginFn}
                className="btn text-xs commonBtn flex items-center justify-center btn w-full"
              >
                {loginLoading ? (
                  <Image
                    src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
                    alt={""}
                    height={100000}
                    width={10000}
                    className={"max-w-full h-[40px] object-contain w-auto"}
                  />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Sign Up",
      content: (
        <>
          <div className="grid gap-3 grid-cols-12">
            {registerTab == 1 && (
              <>
                <div className="col-span-12">
                  <label
                    htmlFor=""
                    className="form-label m-0 font-medium text-xs"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                    className="form-control bg-[var(--backgroundColor2)] border-gray-600 focus:bg-[var(--backgroundColor2)] focus:border-gray-600 text-xs"
                  />
                </div>
                <div className="col-span-12">
                  <label
                    htmlFor=""
                    className="form-label m-0 font-medium text-xs"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="form-control bg-[var(--backgroundColor2)] border-gray-600 focus:bg-[var(--backgroundColor2)] focus:border-gray-600 text-xs"
                  />
                </div>
                <div className="col-span-12">
                  <button
                    disabled={registerOtpLoading}
                    onClick={sendRegisterOtp}
                    className="btn text-xs commonBtn flex items-center justify-center btn w-full"
                  >
                    {registerOtpLoading ? (
                      <Image
                        src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
                        alt={""}
                        height={100000}
                        width={10000}
                        className={"max-w-full h-[40px] object-contain w-auto"}
                      />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </>
            )}

            {registerTab == 2 && (
              <>
                <div className="col-span-12">
                  <label
                    htmlFor=""
                    className="form-label m-0 font-medium text-xs"
                  >
                    OTP
                  </label>
                  <input
                    type="text"
                    value={registerOTP}
                    onChange={(e) => setRegisterOTP(e.target.value)}
                    required
                    className="form-control bg-[var(--backgroundColor2)] border-gray-600 focus:bg-[var(--backgroundColor2)] focus:border-gray-600 text-xs"
                  />
                </div>
                <div className="col-span-12">
                  <button
                    disabled={registerLoading}
                    onClick={registerFn}
                    className="btn text-xs commonBtn flex items-center justify-center btn w-full"
                  >
                    {registerLoading ? (
                      <Image
                        src={process.env.NEXT_PUBLIC_IMAGE_URL + "loading.gif"}
                        alt={""}
                        height={100000}
                        width={10000}
                        className={"max-w-full h-[40px] object-contain w-auto"}
                      />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      ),
    },
  ];
  const [activeTab, setActiveTab] = useState(0);
  const showTab = (tab) => {
    setActiveTab(tab);
  };
  const handleLogin = () => {
    setLogin(!login);
  };
  return (
    <>
      <Modal
        className={` fixed inset-0 flex items-center justify-center cstmModal z-[99999]`}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <div
          className={`modalDialog relative p-2 mx-auto w-full w-full rounded-2 z-10 bg-[var(--backgroundColor)]`}
        >
          <div className="modalBody py-2 px-2">
            <button
              onClick={handleLogin}
              className="border-0 p-0 position-absolute"
              variant="transparent"
              style={{ right: 0, top: 0 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 16 15"
                fill="none"
              >
                <g clip-path="url(#clip0_0_6282)">
                  <path
                    d="M1.98638 14.906C1.61862 14.9274 1.25695 14.8052 0.97762 14.565C0.426731 14.0109 0.426731 13.1159 0.97762 12.5617L13.0403 0.498994C13.6133 -0.0371562 14.5123 -0.00735193 15.0485 0.565621C15.5333 1.08376 15.5616 1.88015 15.1147 2.43132L2.98092 14.565C2.70519 14.8017 2.34932 14.9237 1.98638 14.906Z"
                    fill="var(--textColor)"
                  />
                  <path
                    d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
                    fill="var(--textColor)"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_0_6282">
                    <rect
                      width="15"
                      height="15"
                      fill="var(--textColor)"
                      transform="translate(0.564453)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </button>
            <div
              className="flex nav navpillsTab border-b"
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
                    } tab-button font-medium  w-50 relative py-2 flex-shrink-0 rounded-bl-none rounded-br-none text-xs px-3 py-2 btn`}
                  >
                    {item.title}
                  </button>
                ))}
            </div>
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
      </Modal>
    </>
  );
};

const Modal = styled.div`
  .modalDialog {
    max-width: 500px;
    input {
      color: var(--textColor);
    }
  }
`;

export default LoginPop;
