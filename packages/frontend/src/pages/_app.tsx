import React from 'react';
import { AppProps } from 'next/app';

console.log('toto');

const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default App;
