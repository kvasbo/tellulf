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
  calculatedConsumption: number;
  previousMeasuredProduction: number;
}

export interface TibberRealtimeState extends TibberRealtimeData {
  lastHourByTenMinutes: {};
  avgLastHour: number;
  avgLastHourSamples: number;
  avgLastHourStamp: string;
}

export interface PowerPrice {
  total: number;
}

export interface PowerPriceState {
  [s: number]: PowerPrice;
}
