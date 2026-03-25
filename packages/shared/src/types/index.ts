import { CompareUnit, FieldSource, UnitScope, ValueType } from './enums';

export interface FieldMetaSeed {
  source: FieldSource;
  fieldKey: string;
  labelZh: string;
  labelEn?: string | null;
  descriptionZh?: string | null;
  valueType: ValueType;
  unitScope: UnitScope;
  visibleDefault: boolean;
  aliasEditable: boolean;
  sortOrder: number;
  sampleValue?: string;
}

export interface FormulaProfileConfig {
  demandFieldKey: string;
  executedFieldKey: string;
  purchaseRequestFieldKey?: string;
  purchaseOrderFieldKey?: string;
  purchaseInboundFieldKey?: string;
  purchaseTransitFieldKey?: string;
  salesOccupyFieldKey?: string;
  instantInventoryFieldKey: string;
  compareUnit: CompareUnit;
  threshold: number;
}

export interface ConversionResult {
  value: number | null;
  factor: number | null;
  manualReviewRequired: boolean;
  parsedFrom?: string;
}
