import React from 'react';

import { apiRoutes, toto } from '@monorepo/shared';

console.log('hey');

const Index = () => {
  return (
    <div>
      <div>Welcome to Admin, {toto}</div>
      <div>Login is {apiRoutes.login}</div>
    </div>
  );
};

export default Index;
