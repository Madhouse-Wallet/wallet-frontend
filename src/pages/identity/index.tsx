import { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "@/styles/Identity.module.css";
import { useTheme } from "@/ContextApi/ThemeContext";

export default function Identity() {
  const { theme, toggleTheme } = useTheme();

  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const initializeStripe = async () => {
      try {
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
  }, []);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };

  const handleVerification = async () => {
    setIsLoading(true);
    try {
      // Create the VerificationSession on the server
      const response = await fetch("/api/create-verification-session", {
        method: "POST",
      });
      const { client_secret } = await response.json();

      // Open the modal on the client
      if (stripe) {
        const { error } = await stripe.verifyIdentity(client_secret);
        if (!error) {
          router.push("identity/submitted");
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
        <div className="container">
          <div className="pageCard bg-white/5 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <button
              onClick={() => router.push("/dashboard")}
              className="border-0 p-0 absolute z-[99] top-2 right-2 opacity-40 hover:opacity-70"
              style={{ background: "transparent" }}
            >
              {closeIcn}
            </button>
            <div className="grid gap-3 grid-cols-12">
              <div className=" col-span-12  z-10">
                <div
                  className={` sectionHeader  px-3 py-4 contrast-more:bg-black border-b border-gray-900`}
                >
                  <div className="d-flex align-items-center gap-3 pb-3">
                    <h4 className="m-0 text-24 font-bold -tracking-3 md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Identity
                    </h4>
                  </div>
                </div>
              </div>
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
            </div>
          </div>
        </div>
      </section>
    </>
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
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
);

const closeIcn = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 24 24"
    height="24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
  </svg>
);
