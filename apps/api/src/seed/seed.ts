import { PrismaClient } from '@prisma/client';
import { FIELD_DICTIONARY_SEED, BUILTIN_FORMULA_TEMPLATES, parseConversionFactor } from '@kingdee/shared';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function parseMarkdownTable(filePath: string) {
  const text = fs.readFileSync(filePath, 'utf8');
  return text
    .split('\n')
    .filter((line) => line.trim().startsWith('|') && !line.includes('---') && !line.includes('key | header'))
    .map((line) => line.split('|').map((v) => v.trim()).filter(Boolean))
    .map(([key, header, tips, sample]) => ({ key, header, tips, sample }));
}

async function main() {
  await prisma.user.upsert({ where: { username: 'admin' }, update: {}, create: { username: 'admin', displayName: '默认管理员' } });

  for (const row of FIELD_DICTIONARY_SEED) {
    await prisma.fieldMeta.upsert({
      where: { source_fieldKey: { source: row.source as any, fieldKey: row.fieldKey } },
      update: { labelZh: row.labelZh, descriptionZh: row.descriptionZh, aliasEditable: row.aliasEditable },
      create: row as any,
    });
  }

  const inventoryRows = parseMarkdownTable(path.resolve(process.cwd(), '../../spec/samples/库存查询表返回数据.txt'));
  const byCode = new Map<string, any>();
  for (const r of inventoryRows) {
    if (r.key === 'materialid_number') byCode.set(r.sample, { productCode: r.sample });
  }

  // 固定样例商品快照
  const sampleProducts = [
    { productCode: 'A1001', productName: '一次性手套', warehouseCode: 'CK001', warehouseName: '主仓', baseUnit: '副', auxUnit: '箱', floatBaseUnit: '包', conversionRate: '1 箱 = 180 副', latestInventory: 360 },
    { productCode: 'A1002', productName: '防护口罩', warehouseCode: 'CK001', warehouseName: '主仓', baseUnit: '只', auxUnit: '箱', floatBaseUnit: '包', conversionRate: '1 箱 ≈ 480 只', latestInventory: 2200 },
  ];

  for (const p of sampleProducts) {
    const parsed = parseConversionFactor(p.conversionRate || '');
    await prisma.productMaster.upsert({
      where: { id: `${p.productCode}-${p.warehouseCode}` },
      update: { ...p, conversionFactor: parsed.factor, conversionParsed: parsed.factor !== null, manualReviewRequired: parsed.manualReviewRequired },
      create: { id: `${p.productCode}-${p.warehouseCode}`, ...p, conversionFactor: parsed.factor, conversionParsed: parsed.factor !== null, manualReviewRequired: parsed.manualReviewRequired },
    });
  }

  for (const t of BUILTIN_FORMULA_TEMPLATES) {
    await prisma.formulaProfile.upsert({
      where: { id: t.name },
      update: { description: t.name, configJson: t.config as any },
      create: { id: t.name, name: t.name, description: t.name, configJson: t.config as any },
    });
  }

  console.log('seed done');
}

main().finally(async () => prisma.$disconnect());
