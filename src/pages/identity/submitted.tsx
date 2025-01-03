// pages/submitted.tsx
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Identity.module.css';

export default function Submitted() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Verification Submitted</title>
        <meta name="description" content="Identity verification submitted" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className={styles.verificationSection}>
          <div>
            <h1 className={styles.title}>
              Thanks for submitting your identity document.
            </h1>
            <p className={styles.message}>We are processing your verification.</p>
            {/* <Link href="/" className={styles.link}>
              Restart demo
            </Link> */}
          </div>
        </section>
      </main>
    </div>
  );
}