import React from 'react';
import {Html, Head, Main, NextScript} from 'next/document';

export default function MyDocument() {
  return (
    <Html lang="mn">
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <script src="/noflash.js" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
