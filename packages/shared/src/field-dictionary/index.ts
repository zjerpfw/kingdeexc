import { FIELD_DICTIONARY_SEED } from '../metadata/fieldDictionary';

export const fieldDictMap = new Map(FIELD_DICTIONARY_SEED.map((f) => [`${f.source}:${f.fieldKey}`, f]));

export function getFieldLabel(source: string, key: string): string {
  const item = fieldDictMap.get(`${source}:${key}`);
  return `${item?.labelZh || key}（${key}）`;
}

export function getFieldTooltip(source: string, key: string): string {
  const item = fieldDictMap.get(`${source}:${key}`);
  return item?.descriptionZh || key;
}
