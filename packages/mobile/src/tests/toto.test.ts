import { getTiti, getToto } from '../toto';

test('toto', () => {
  expect(getToto()).toEqual('toto');
});

test('titi', () => {
  expect(getTiti()).toEqual('titi');
});
