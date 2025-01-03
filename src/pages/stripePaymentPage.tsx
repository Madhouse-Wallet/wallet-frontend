import React, { useEffect, useState, useCallback } from "react";
import { loadStripeOnramp } from "@stripe/crypto";
import { CryptoElements, OnrampElement } from "@/components/stripe/StripeCryptoElements";
import styled from "styled-components";

// Load Stripe Onramp with your publishable API key
const stripeOnrampPromise = loadStripeOnramp(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const StripePaymentPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Fetch the onramp session and set the client secret
    try {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}user/create-onramp-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_details: {
            destination_currency: "btc",
            destination_exchange_amount: "10000000",
            destination_network: "ethereum"
          },
        }),
      })
        .then((res) => res.json())
        .then((data) =>{
          console.log("data-->",data);
          setClientSecret(data.data.clientSecret)
        });
    } catch (error) {
      console.log(error)
    }
   
  }, []);

  const onChange = useCallback(({ session }: { session: any }) => {
    setMessage(`OnrampSession is now in ${session.status} state.`);
  }, []);

  return (
    <PaymentSec className="py-5">
      <div className="container">
        <div className="grid gap-3 grid-cols-12">
          <div className="col-span-12">
            <div className="mx-auto">
              {clientSecret ? (
                <CryptoElements stripeOnramp={stripeOnrampPromise}>
                  <OnrampElement
                    id="onramp-element"
                    clientSecret={clientSecret}
                    appearance={{ theme: "dark" }}
                    onChange={onChange}
                  />
                </CryptoElements>
              ) : (
                <p className="text-center">Loading payment...</p>
              )}
              {message && <div id="onramp-message">{message}</div>}
            </div>
          </div>
        </div>
      </div>
    </PaymentSec>
  );
};

const PaymentSec = styled.section`
#onramp-element {
  iframe {
  margin: 0 auto !important;
  }
  }

  #onramp-message {
    margin-top: 20px;
    color: rgb(105, 115, 134);
    font-size: 16px;
    line-height: 20px;
    text-align: center;
  }

  #onramp-element {
    margin: 20px 0;
  }

  button {
    background: #0055de;
    font-family: Arial, sans-serif;
    color: #ffffff;
    border-radius: 4px;
    border: 0;
    padding: 12px 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
  }

  button:hover {
    filter: contrast(115%);
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export default StripePaymentPage;
