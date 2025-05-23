import React, { useEffect, useState, useCallback } from "react";
import { loadStripeOnramp } from "@stripe/crypto";
import {
  CryptoElements,
  OnrampElement,
} from "@/components/stripe/StripeCryptoElements";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

// Load Stripe Onramp with your publishable API key
const stripeOnrampPromise = loadStripeOnramp(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripePaymentPageProps {
  walletAddress?: string;
  amount?: number;
  currency?: string;
}

const StripePaymentPageETH: React.FC<StripePaymentPageProps> = ({
  walletAddress,
  amount = 10,
  currency = "USD",
}) => {
  const userAuth = useSelector((state: any) => state.Auth);
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        if (!userAuth) {
          return;
        }
        setIsLoading(true);

        const btcAddress = userAuth?.walletAddress; // Replace with your default Bitcoin address

        if (!btcAddress) {
          setMessage("Wallet address is required");
          return;
        }

        const response = await fetch("/api/create-onramp-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_address: btcAddress,
            sourceCurrency: "usd",
            destinationCurrency: "usdc",
            destinationNetwork: "ethereum",
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setClientSecret(data.clientSecret);
        } else {
          setMessage(`Error: ${data.error}`);
        }
      } catch (error) {
        setMessage("Failed to initialize payment session");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [walletAddress, amount, currency, router.query]);

  const onChange = useCallback(({ session }: { session: any }) => {
    setMessage(`OnrampSession is now in ${session.status} state.`);
  }, []);

  return (
    <PaymentSec className="py-4">
      <div className="container">
        <div className="grid gap-3 grid-cols-12">
          <div className="col-span-12">
            <div className="sectionHeader pb-2 border-bottom border-secondary mb-4"></div>
          </div>
          <div className="col-span-12">
            <div className="mx-auto formMain">
              {isLoading ? (
                <p className="text-center">Loading payment interface...</p>
              ) : clientSecret ? (
                <CryptoElements stripeOnramp={stripeOnrampPromise}>
                  <OnrampElement
                    id="onramp-element"
                    clientSecret={clientSecret}
                    appearance={{
                      theme: "dark",
                      variables: {
                        colorPrimary: "#0055de",
                        colorBackground: "#1a1a1a",
                        colorText: "#ffffff",
                        colorTextSecondary: "#999999",
                      },
                    }}
                    onChange={onChange}
                  />
                </CryptoElements>
              ) : (
                <p className="text-center text-red-500">{message}</p>
              )}
              {message && clientSecret && (
                <div id="onramp-message" className="mt-4 text-gray-400">
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PaymentSec>
  );
};

const PaymentSec = styled.section`
  .formMain {
    max-width: 540px;
    margin: 0 auto;

    #onramp-element {
      iframe {
        margin: 0 auto !important;
        min-height: 600px;
        width: 100%;
      }
    }

    #onramp-message {
      margin-top: 20px;
      color: rgb(105, 115, 134);
      font-size: 16px;
      line-height: 20px;
      text-align: center;
    }
  }
`;

export default StripePaymentPageETH;
