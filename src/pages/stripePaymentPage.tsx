// pages/stripePaymentPage.tsx

import { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/stripe/CheckoutForm";
import { StripeElementsOptions } from "@stripe/stripe-js";
import CompletePage from "@/components/stripe/CompleteForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const StripePaymentPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  useEffect(() => {
    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
    setConfirmed(!!clientSecret);
  }, []);

  const appearance = {
    theme: "stripe",
  };
  
  const options: StripeElementsOptions = {
    clientSecret: clientSecret || "",
  };

  return (
    <div>
      {/* <h2>Complete Your Payment</h2> */}
      {clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          {confirmed ? <CompletePage /> : <CheckoutForm />}
        </Elements>
      ) : (
        <p>Loading payment...</p>
      )}
    </div>
  );
};

export default StripePaymentPage;
