export interface NormalizedInventoryRow {
  productCode: string;
  productName: string;
  warehouseCode?: string;
  warehouseName?: string;
  baseUnit?: string;
  auxUnit?: string;
  floatBaseUnit?: string;
  conversionRate?: string;
  instantQtyBase?: number;
  validQtyBase?: number;
  auxQty?: number;
  validAuxQty?: number;
}

export interface NormalizedOrderRow {
  productCode: string;
  productName: string;
  warehouse?: string;
  unit?: string;
  qty?: number;
  baseUnit?: string;
  baseQty?: number;
  auxUnit?: string;
  auxQty?: number;
  conversionRate?: string;
  invQty?: number;
  instantQty?: number;
  expValidQty?: number;
  salOccupyQty?: number;
  outQty?: number;
  pickQty?: number;
  pickOutQty?: number;
  pickBaseQty?: number;
  pickOutBaseQty?: number;
  purRequestQty?: number;
  purOrdQty?: number;
  purOrdInQty?: number;
  purTransitQty?: number;
}

export interface ReplacementSuggestion {
  targetProductCode: string;
  targetProductName: string;
  warehouseName?: string;
  baseInventory: number;
  coverageInOrderUnit?: number;
  canFullyCover: boolean;
}

export interface GapDecision {
  productCode: string;
  productName: string;
  orderUnit?: string;
  baseUnit?: string;
  demandBase: number;
  executedBase: number;
  inventoryBase: number;
  gapBase: number;
  formulaName: string;
  warnings: string[];
  suggestions: ReplacementSuggestion[];
  calculationSteps: Array<{ key: string; label: string; rawValue: unknown; unit?: string; normalizedValue: number }>;
}

export interface RulePackage {
  version: string;
  releasedAt: string;
  fieldDictionary: Array<{ source: string; fieldKey: string; labelZh: string; descriptionZh?: string }>;
  formulaProfiles: Array<{ id: string; name: string; configJson: any }>;
  replacementRules: Array<{ sourceProductCode: string; targetProductCode: string; targetProductName: string; priority: number; enabled: boolean }>;
  productSnapshot: Array<{ productCode: string; productName: string; warehouseName?: string; baseUnit?: string; conversionRate?: string; latestInventory?: number }>;
  checksum: string;
}

export interface PluginSettings {
  autoPopup: boolean;
  onlyFullyCover: boolean;
  showWhenConversionFailed: boolean;
}
