export enum FieldSource {
  inventory_report = 'inventory_report',
  sales_order_detail = 'sales_order_detail',
}

export enum ValueType {
  number = 'number',
  string = 'string',
  object = 'object',
  date = 'date',
  basedata = 'basedata',
}

export enum UnitScope {
  order_unit = 'order_unit',
  base_unit = 'base_unit',
  aux_unit = 'aux_unit',
  none = 'none',
}

export enum CompareUnit {
  order_unit = 'order_unit',
  base_unit = 'base_unit',
}
