import { useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '@/styles/Identity.module.css';

export default function Identity() {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
const initializeStripe = async () => {
      try {
        const response = await fetch('/api/config');
        const { publishableKey } = await response.json();
        const stripeInstance = await loadStripe(publishableKey);
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        // alert('Failed to initialize verification system');
      }
    };
    
    initializeStripe();
  }, []);

  const handleVerification = async () => {
    setIsLoading(true);
    try {
      // Create the VerificationSession on the server
      const response = await fetch('/api/create-verification-session', {
        method: 'POST',
      });
      const { client_secret } = await response.json();

      // Open the modal on the client
      if (stripe) {
        const { error } = await stripe.verifyIdentity(client_secret);
        if (!error) {
          router.push('identity/submitted');
        } else {
          // alert(error.message);
          console.log(error.message)
        }
      }
    } catch (error) {
      console.error('Verification failed:', error);
      // alert('Verification process failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Identity Verification</title>
        <meta name="description" content="Stripe Identity Verification" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className={styles.verificationSection}>
          <div>
            <h1 className={styles.title}>Verify your identity to book</h1>
            <h4 className={styles.subtitle}>
              Get ready to take a photo of your ID and a selfie
            </h4>
            <button 
              onClick={handleVerification}
              className={styles.verifyButton}
              disabled={isLoading || !stripe}
            >
              {isLoading ? 'Loading...' : 'Verify me'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}