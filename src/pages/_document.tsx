import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />

        <link rel="icon" href="/favicn.png" />

        <link
          rel="stylesheet"
          href="https://shadcdn.com/package/@shadcdn/library-name/style.css"
        />
        <title>Madhouse Wallet</title>
      </Head>
      <body className="">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
