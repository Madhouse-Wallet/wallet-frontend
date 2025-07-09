import { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import Head from "next/head";
import { useRouter } from "next/router";
import { BackBtn } from "@/components/common";
import { useSelector } from "react-redux";
import UserStep from "./UserStep";
import PaymentTabComponent from "./PaymentTabComponent";
import { getUser } from "@/lib/apiCall";
import styled from "styled-components";

export default function Identity() {
  const userAuth = useSelector((state: any) => state.Auth);
  const [step, setStep] = useState("");
  // const [step, setStep] = useState("PaymentTab");
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const userExist = await getUser(userAuth.email);
      if (!userExist) {
        return;
      }
      if (userExist?.userId?.kyc?.status === "success") {
        try {
          const response = await fetch(
            `/api/business-account/${userAuth?.email}`,
            {
              method: "GET",
            }
          );

          const result = await response.json();

          if (result.business.id) {
            setStep("PaymentTab");
          } else {
            console.error("API Error:", result.error);
            setStep("user");
          }
        } catch (error) {
          console.log(error);
        }
      } else if (userExist?.userId?.kyc?.status === "processing") {
        setStep("processing");
      } else {
        const initializeStripe = async () => {
          try {
            setStep("identity");
            const response = await fetch("/api/config");
            const { publishableKey } = await response.json();
            const stripeInstance = await loadStripe(publishableKey);
            setStripe(stripeInstance);
          } catch (error) {
            console.error("Failed to initialize Stripe:", error);
          }
        };

        initializeStripe();
      }
    };

    fetchData();
    // fetchData();
  }, []);

  const handleVerification = async () => {
    setIsLoading(true);
    try {
      // Create the VerificationSession on the server
      const response = await fetch("/api/create-verification-session", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ userId: userAuth?.id }),
      });
      const { client_secret } = await response.json();

      // Open the modal on the client
      if (stripe) {
        const { error } = await stripe.verifyIdentity(client_secret);
        if (!error) {
          const userExist = await getUser(userAuth.email);
          if (userExist?.userId?.kyc?.status === "success") {
            setStep("user");
          } else {
            router.push("/");
          }
        } else {
          console.log(error.message);
        }
      }
    } catch (error) {
      console.error("Verification failed:", error);
      // alert('Verification process failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Identity Verification</title>
        <meta name="description" content="Stripe Identity Verification" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className=" realtive identity h-full flex items-center py-[30px] sm:flex-row flex-col">
        <div className="absolute inset-0 backdrop-blur-xl h-full"></div>

        <div className="px-3 mx-auto relative w-full sm:min-w-[500px] sm:max-w-[max-content]">
          <button
            onClick={() => router.push("/dashboard")}
            className="border-0 p-0 absolute z-[99] top-[12px] right-[25px] opacity-40 hover:opacity-70"
            style={{ background: "transparent" }}
          >
            {closeIcn}
          </button>
          <header className="siteHeader top-0 py-2 w-full z-[999]">
            <div className="">
              <Nav className=" px-3 py-3 rounded-[20px] shadow relative flex items-center justify-center flex-wrap gap-2">
                <div className="left">
                  <h4 className="m-0 text-[22px] font-bold -tracking-3 flex-1 whitespace-nowrap capitalize leading-none">
                    Payments
                  </h4>
                </div>
              </Nav>
            </div>
          </header>
          <div
            className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 datbackg
          a-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]"
          >
            <div className="grid gap-3 grid-cols-12 px-2 py-3">
              <div className="p-2 px-3 px-lg-4 col-span-12">
                <div className="flex flex-col gap-4">
                  {step === "identity" ? (
                    <>
                      <div className="col-span-12 pt-8">
                        <div
                          className="cardCstm p-3 rounded-3 lg:p-6 text-center mx-auto bg-[var(--backgroundColor)]"
                          // style={{ maxWidth: 400 }}
                        >
                          <h1 className="font-bold m-0 py-2 text-2xl">
                            Verify your identity to book
                          </h1>
                          <h4 className=" text-xs m-0 py-2">
                            Get ready to take a photo of your ID and a selfie.
                          </h4>
                          <div className="btnWRpper mt-3">
                            <button
                              onClick={handleVerification}
                              className="inline-flex items-center justify-center commonBtn btn "
                              disabled={isLoading || !stripe}
                            >
                              {isLoading ? "Loading..." : "Verify me"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : step === "user" ? (
                    <>
                      <UserStep step={step} setStep={setStep} />
                    </>
                  ) : step === "PaymentTab" ? (
                    <>
                      <PaymentTabComponent step={step} setStep={setStep} />
                    </>
                  ) : step === "processing" ? (
                    <>
                      <div className="col-span-12 pt-8">
                        <div
                          className="cardCstm p-3 rounded-3 lg:p-6 text-center mx-auto bg-[var(--backgroundColor)]"
                          style={{ maxWidth: 400 }}
                        >
                          <h1 className="font-bold m-0 py-2 text-2xl">
                            Verifying your identity
                          </h1>
                          <h4 className=" text-xs m-0 py-2">
                            Please wait while we process your ID and selfie.
                            This may take a moment.
                          </h4>
                        </div>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const Nav = styled.nav`
  // background: var(--cardBg);
  background: #5c2a28a3;
  backdrop-filter: blur(12.8px);
`;

const closeIcn = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
  </svg>
);
