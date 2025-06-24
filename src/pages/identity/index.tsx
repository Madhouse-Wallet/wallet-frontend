import { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import Head from "next/head";
import { useRouter } from "next/router";
import { BackBtn } from "@/components/common";
import { useSelector } from "react-redux";
import UserStep from "./UserStep";
import PaymentTabComponent from "./PaymentTabComponent";
import { getUser } from "@/lib/apiCall";

export default function Identity() {
  const userAuth = useSelector((state: any) => state.Auth);
  const [step, setStep] = useState("identity");
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const userExist = await getUser(userAuth.email);
      console.log("userExist", userExist);
      if (!userExist) {
        return;
      }
      if (userExist?.userId?.kyc === "success") {
        setStep("user");
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
            // alert('Failed to initialize verification system');
          }
        };

        initializeStripe();
      }
    };

    fetchData();
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
          router.push("/");
        } else {
          // alert(error.message);
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
      <section className="pt-12 realtive identity">
        <div className="container relative">
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12">
              <div className=" col-span-12  z-10">
                <div
                  className={` sectionHeader  px-3 py-4 contrast-more:bg-black border-b border-gray-900`}
                >
                  <div className="flex align-items-center gap-3 pb-3">
                    <BackBtn />
                    <h4 className="m-0 text-[18px] sm:text-[20px] font-bold -tracking-3 md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Payments
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {step === "identity" ? (
              <>
                <div className="col-span-12 pt-8">
                  <div
                    className="cardCstm p-3 rounded-3 lg:p-6 text-center mx-auto bg-[var(--backgroundColor)]"
                    style={{ maxWidth: 400 }}
                  >
                    <h1 className="font-bold m-0 py-2 text-2xl">
                      Verify your identity to book
                    </h1>
                    <h4 className=" text-xs m-0 py-2">
                      Get ready to take a photo of your ID and a selfie
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
            ) : (
              <></>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
