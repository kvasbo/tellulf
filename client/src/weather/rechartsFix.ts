import type { Area, CartesianGrid } from 'recharts';

//eslint-disable-next-line @typescript-eslint/no-var-requires
const AreaImpl: typeof Area = require('recharts/es6/cartesian/Area').default;
//eslint-disable-next-line @typescript-eslint/no-var-requires
const CartesianGridImpl: typeof CartesianGrid = require('recharts/es6/cartesian/CartesianGrid')
  .default;

export { AreaImpl as Area, CartesianGridImpl as CartesianGrid };
