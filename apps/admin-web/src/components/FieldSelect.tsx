import { getFieldTooltip, MISSING_DESC_TEXT } from '@kingdee/shared';
import { Select, Tooltip } from 'antd';

export function FieldSelect({ fields, value, onChange }: { fields: any[]; value?: string; onChange?: (v: string) => void }) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={fields.map((f) => ({
        value: f.fieldKey,
        label: <Tooltip title={f.descriptionZh || getFieldTooltip(f.source, f.fieldKey) || MISSING_DESC_TEXT}>{`${f.labelZh}（${f.fieldKey}）`}</Tooltip>,
      }))}
      showSearch
    />
  );
}
