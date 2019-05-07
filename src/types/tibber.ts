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
