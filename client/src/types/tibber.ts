export interface TibberUsageAPIData {
  to: string;
  from: string;
  calculatedTime: number | undefined;
  consumption: number;
  consumptionUnit: string;
  totalCost: number;
  unitCost: number;
  unitPrice: number;
  unitPriceVAT: number;
}

export interface TibberUsageState {
  [s: string]: TibberUsageAPIData;
}

export interface TibberRealtimeData {
  accumulatedConsumption: number;
  accumulatedCost: number;
  accumulatedProduction: number;
  accumulatedReward: number;
  averagePower: number;
  currency: string;
  lastMeterConsumption: number;
  lastMeterProduction: number;
  maxPower: number;
  maxPowerProduction: number;
  minPower: number;
  minPowerProduction: number;
  power: number;
  powerProduction: number;
  timestamp: string;
}

export interface TibberRealtimeState extends TibberRealtimeData {
  lastHourByTenMinutes: Record<string, unknown>;
  avgLastHour: number;
  avgLastHourSamples: number;
  avgLastHourStamp: string;
  calculatedConsumption: number;
  calculatedHomeAndCabinTotal: number;
  previousMeasuredProduction: number;
  actualCost: number;
}

export type houses = 'hytta' | 'hjemme';
// The state of the store
export interface TibberRealTimeDataState {
  hytta: TibberRealtimeState;
  hjemme: TibberRealtimeState;
  totalNetUsage: number;
}

export interface PowerPrice {
  total: number;
}

export interface PowerPriceState {
  [s: number]: PowerPrice;
}

export interface TibberConsumptionNode {
  from: string;
  to: string;
  totalCost: number;
  unitCost: number;
  unitPrice: number;
  unitPriceVAT: number;
  consumption: number;
  consumptionUnit: string;
}

export interface TibberConsumptionReturn {
  nodes: [TibberConsumptionNode];
}

export interface TibberProductionNode {
  from: string;
  to: string;
  profit: number;
  unitPrice: number;
  unitPriceVAT: number;
  production: number;
  productionUnit: string;
}

export interface TibberProductionReturn {
  nodes: [TibberProductionNode];
}
