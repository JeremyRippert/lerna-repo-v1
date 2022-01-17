import { getTiti, getToto } from '../src/toto';

test('toto', () => {
  expect(getToto()).toEqual('toto');
});

test('titi', () => {
  expect(getTiti()).toEqual('titi');
});
