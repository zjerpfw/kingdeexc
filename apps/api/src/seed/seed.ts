import { PrismaClient } from '@prisma/client';
import { FIELD_DICTIONARY_SEED, BUILTIN_FORMULA_TEMPLATES, parseConversionFactor } from '@kingdee/shared';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({ where: { username: 'admin' }, update: {}, create: { username: 'admin', displayName: '默认管理员' } });

  for (const row of FIELD_DICTIONARY_SEED) {
    await prisma.fieldMeta.upsert({
      where: { source_fieldKey: { source: row.source as any, fieldKey: row.fieldKey } },
      update: { labelZh: row.labelZh, descriptionZh: row.descriptionZh, aliasEditable: row.aliasEditable, sampleValue: row.sampleValue },
      create: row as any,
    });
  }

  const sampleProducts = [
    { productCode: 'A1001', productName: '一次性手套', warehouseCode: 'CK001', warehouseName: '主仓', baseUnit: '副', auxUnit: '箱', floatBaseUnit: '包', conversionRate: '1 箱 = 180 副', latestInventory: 360 },
    { productCode: 'A1002', productName: '防护口罩', warehouseCode: 'CK001', warehouseName: '主仓', baseUnit: '只', auxUnit: '箱', floatBaseUnit: '包', conversionRate: '1 箱 ≈ 480 只', latestInventory: 2200 },
    { productCode: 'A1003', productName: '医用酒精棉片', warehouseCode: 'CK002', warehouseName: '辅仓', baseUnit: '片', auxUnit: '盒', floatBaseUnit: '包', conversionRate: '1 盒 = 50 片', latestInventory: 800 },
    { productCode: 'A1004', productName: '防护服', warehouseCode: 'CK001', warehouseName: '主仓', baseUnit: '件', auxUnit: '箱', floatBaseUnit: '包', conversionRate: '1 箱 = 20 件', latestInventory: 120 },
    { productCode: 'A1005', productName: '护目镜', warehouseCode: 'CK002', warehouseName: '辅仓', baseUnit: '副', auxUnit: '箱', floatBaseUnit: '包', conversionRate: '1 箱 ≈ 95 副', latestInventory: 180 },
  ];

  for (const p of sampleProducts) {
    const parsed = parseConversionFactor(p.conversionRate || '');
    const id = `${p.productCode}-${p.warehouseCode}`;
    await prisma.productMaster.upsert({
      where: { id },
      update: { ...p, conversionFactor: parsed.factor, conversionParsed: parsed.factor !== null, manualReviewRequired: parsed.manualReviewRequired },
      create: { id, ...p, conversionFactor: parsed.factor, conversionParsed: parsed.factor !== null, manualReviewRequired: parsed.manualReviewRequired },
    });

    await prisma.unitConversion.upsert({
      where: { id },
      update: { productCode: p.productCode, fromUnit: p.auxUnit || '-', toUnit: p.baseUnit || '-', factor: parsed.factor, formulaText: p.conversionRate, parsedSuccess: parsed.factor !== null, manualReviewRequired: parsed.manualReviewRequired },
      create: { id, productCode: p.productCode, fromUnit: p.auxUnit || '-', toUnit: p.baseUnit || '-', factor: parsed.factor, formulaText: p.conversionRate, parsedSuccess: parsed.factor !== null, manualReviewRequired: parsed.manualReviewRequired },
    });
  }

  for (const t of BUILTIN_FORMULA_TEMPLATES) {
    await prisma.formulaProfile.upsert({
      where: { id: t.name },
      update: { name: t.name, description: t.name, configJson: t.config as any },
      create: { id: t.name, name: t.name, description: t.name, configJson: t.config as any },
    });
  }

  const rules = [
    { sourceProductCode: 'A1001', sourceProductName: '一次性手套', targetProductCode: 'A1002', targetProductName: '防护口罩', priority: 1 },
    { sourceProductCode: 'A1001', sourceProductName: '一次性手套', targetProductCode: 'A1005', targetProductName: '护目镜', priority: 2 },
    { sourceProductCode: 'A1004', sourceProductName: '防护服', targetProductCode: 'A1003', targetProductName: '医用酒精棉片', priority: 1 },
  ];

  for (const r of rules) {
    await prisma.replacementRule.upsert({
      where: { ruleId: `${r.sourceProductCode}->${r.targetProductCode}` },
      update: { ...r, enabled: true, updatedBy: 'admin' },
      create: { ruleId: `${r.sourceProductCode}->${r.targetProductCode}`, ...r, enabled: true, createdBy: 'admin', updatedBy: 'admin' },
    });
  }

  const fieldDictionary = await prisma.fieldMeta.findMany({ orderBy: { sortOrder: 'asc' } });
  const formulaProfiles = await prisma.formulaProfile.findMany({ where: { enabled: true } });
  const replacementRules = await prisma.replacementRule.findMany({ where: { enabled: true } });
  const productSnapshot = await prisma.productMaster.findMany();
  const version = 'v-seed-initial';
  const releasedAt = new Date().toISOString();
  const basePayload = { version, releasedAt, fieldDictionary, formulaProfiles, replacementRules, productSnapshot };
  const checksum = createHash('sha256').update(JSON.stringify(basePayload)).digest('hex');
  const payload = { ...basePayload, checksum };

  await prisma.ruleRelease.upsert({
    where: { version },
    update: { payloadJson: payload as any, checksum },
    create: { version, releasedAt: new Date(releasedAt), payloadJson: payload as any, checksum, createdBy: 'admin' },
  });

  await prisma.auditLog.create({
    data: {
      actor: 'admin',
      action: 'seed',
      entityType: 'System',
      entityId: 'seed-v1',
      beforeJson: null,
      afterJson: { productCount: sampleProducts.length, ruleCount: rules.length, formulaCount: formulaProfiles.length } as any,
    },
  });

  console.log('seed done');
}

main().finally(async () => prisma.$disconnect());
