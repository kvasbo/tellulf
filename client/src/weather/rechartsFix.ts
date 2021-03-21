import type { Area, CartesianGrid } from 'recharts';

const AreaImpl: typeof Area = require('recharts/es6/cartesian/Area').default;
const CartesianGridImpl: typeof CartesianGrid = require('recharts/es6/cartesian/CartesianGrid')
  .default;

/*
const ResponsiveContainerImpl: typeof ResponsiveContainer = require('recharts/es6/component/ResponsiveContainer').default
const AreaChartImpl: typeof AreaChart = require('recharts/es6/chart/AreaChart').default
const XAxisImpl: typeof XAxis = require('recharts/es6/cartesian/XAxis').default
const YAxisImpl: typeof YAxis = require('recharts/es6/cartesian/YAxis').default
const TooltipImpl: typeof Tooltip = require('recharts/es6/component/Tooltip').default
*/

export { AreaImpl as Area, CartesianGridImpl as CartesianGrid };
