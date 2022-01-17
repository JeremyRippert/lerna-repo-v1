import React from 'react';
import Image from 'next/image';
import logo from 'public/vercel.svg';

import { apiRoutes, toto } from '@monorepo/shared';

console.log('hey');

const Index = () => {
  return (
    <div>
      <div>Welcome to Admin, {toto}</div>
      <div>Login is {apiRoutes.login}</div>
      <Image src={logo} alt="Vercel Logo" width={72} height={16} />
    </div>
  );
};

export default Index;
