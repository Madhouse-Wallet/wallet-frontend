// import React, { useEffect, useState, useCallback } from "react";
// import { loadStripeOnramp } from "@stripe/crypto";
// import {
//   CryptoElements,
//   OnrampElement,
// } from "@/components/stripe/StripeCryptoElements";
// import styled from "styled-components";
// import { useRouter } from "next/router";

// // Load Stripe Onramp with your publishable API key
// const stripeOnrampPromise = loadStripeOnramp(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
// );

// const StripePaymentPage: React.FC = () => {
//   const router = useRouter();
//   const handleGoBack = () => {
//     if (typeof window !== "undefined" && window.history.length > 1) {
//       router.back(); // Navigates to the previous page
//     } else {
//       router.push("/"); // Fallback: Redirects to the homepage
//     }
//   };
//   const [clientSecret, setClientSecret] = useState<string | null>(null);
//   const [message, setMessage] = useState<string>("");

//   useEffect(() => {
//     // Fetch the onramp session and set the client secret
//     try {
//       fetch(`/api/create-onramp-session`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           transaction_details: {
//             destination_currency: "btc",
//             destination_exchange_amount: "10000000",
//             destination_network: "ethereum",
//           },
//         }),
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           console.log("data-->", data);
//           setClientSecret(data.clientSecret);
//         });
//     } catch (error) {
//       console.log(error);
//     }
//   }, []);

//   const onChange = useCallback(({ session }: { session: any }) => {
//     setMessage(`OnrampSession is now in ${session.status} state.`);
//   }, []);

//   return (
//     <PaymentSec className="">
//       <div className="container">
//         <div className="grid gap-3 grid-cols-12">
//           <div className="col-span-12">
//             <div className="mx-auto formMain">
//               {clientSecret ? (
//                 <CryptoElements stripeOnramp={stripeOnrampPromise}>
//                   <OnrampElement
//                     id="onramp-element"
//                     clientSecret={clientSecret}
//                     appearance={{ theme: "dark" }}
//                     onChange={onChange}
//                   />
//                 </CryptoElements>
//               ) : (
//                 <p className="text-center">Loading payment...</p>
//               )}
//               {message && <div id="onramp-message">{message}</div>}
//             </div>
//           </div>
//         </div>
//       </div>
//     </PaymentSec>
//   );
// };

// const PaymentSec = styled.section`
//   .formMain {
//     #onramp-element {
//       iframe {
//         margin: 0 auto !important;
//       }
//     }

//     #onramp-message {
//       margin-top: 20px;
//       color: rgb(105, 115, 134);
//       font-size: 16px;
//       line-height: 20px;
//       text-align: center;
//     }

//     #onramp-element {
//       margin: 20px 0;
//     }

//     button {
//       background: #0055de;
//       font-family: Arial, sans-serif;
//       color: #ffffff;
//       border-radius: 4px;
//       border: 0;
//       padding: 12px 16px;
//       font-size: 16px;
//       font-weight: 600;
//       cursor: pointer;
//       transition: all 0.2s ease;
//       width: 100%;
//     }

//     button:hover {
//       filter: contrast(115%);
//     }

//     button:disabled {
//       opacity: 0.5;
//       cursor: default;
//     }
//   }
// `;

// export default StripePaymentPage;

// const backIcn = (
//   <svg
//     width="20"
//     height="20"
//     viewBox="0 0 24 24"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path
//       fill-rule="evenodd"
//       clip-rule="evenodd"
//       d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
//       fill="currentColor"
//       stroke="currentColor"
//       stroke-width="2"
//       stroke-linejoin="round"
//     />
//   </svg>
// );


import React, { useEffect, useState, useCallback } from "react";
import { loadStripeOnramp } from "@stripe/crypto";
import { CryptoElements, OnrampElement } from "@/components/stripe/StripeCryptoElements";
import styled from "styled-components";
import { useRouter } from "next/router";

// Load Stripe Onramp with your publishable API key
const stripeOnrampPromise = loadStripeOnramp(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripePaymentPageProps {
  walletAddress?: string;
  amount?: number;
  currency?: string;
}

const StripePaymentPage: React.FC<StripePaymentPageProps> = ({ 
  walletAddress,
  amount = 10,
  currency = 'USD' 
}) => {
  console.log("walletAddress",walletAddress)
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const amountValue = amount || Number(router.query.amount) || 10;
        const currencyValue = currency || router.query.currency as string || 'USD';
        // const btcAddress = walletAddress;

        const btcAddress =  process.env.NEXT_PUBLIC_QUIENCY_BTC_WALLET_ADDRESS; // Replace with your default Bitcoin address

        if (!btcAddress) { 
          setMessage('Wallet address is required');
          return;
        }

        const response = await fetch('/api/create-onramp-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet_address: btcAddress,
            sourceCurrency:"usd",
            destinationCurrency:"btc",
            destinationNetwork:"bitcoin"
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setClientSecret(data.clientSecret);
        } else {
          setMessage(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('Failed to initialize payment session');
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
            <div className="sectionHeader pb-2 border-bottom border-secondary mb-4">
              {/* <div className="d-flex align-items-center gap-3">
                <button
                  onClick={handleGoBack}
                  className="border-0 themeClr p-0"
                >
                  <BackIcon />
                </button>
                <h4 className="m-0 text-2xl font-bold">Buy Ethereum</h4>
              </div> */}
            </div>
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
                        colorPrimary: '#0055de',
                        colorBackground: '#1a1a1a',
                        colorText: '#ffffff',
                        colorTextSecondary: '#999999',
                      }
                    }}
                    onChange={onChange}
                  />
                </CryptoElements>
              ) : (
                <p className="text-center text-red-500">{message}</p>
              )}
              {/* {message && clientSecret && (
                <div id="onramp-message" className="mt-4 text-gray-400">
                  {message}
                </div>
              )} */}
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

export default StripePaymentPage;