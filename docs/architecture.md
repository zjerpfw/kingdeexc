# 金蝶精斗云库存替代决策中心实施计划与架构

## 1. 实施计划（先行）
1. 解析样例文件，构建字段元数据字典（区分 inventory_report 与 sales_order_detail）。
2. 建立 pnpm monorepo：`apps/api`、`apps/admin-web`、`packages/shared`。
3. 在 `packages/shared` 统一沉淀枚举、字段标签、公式模板、换算器与计算器。
4. 在 `apps/api` 建立 NestJS + Prisma 数据模型、REST API、发布与回滚机制、审计日志。
5. 编写 seed 脚本：自动导入字段字典、样例商品、预置公式模板。
6. 在 `apps/admin-web` 搭建后台页面：登录、仪表盘、商品、字段字典、规则、公式、发布、审计。
7. 增加基础测试：换算器单测、公式引擎单测、前端 smoke 测试。

## 2. 模块拆分
- `packages/shared`
  - 字段元数据字典（含 tooltip 说明、显示格式 `中文名（key）`）
  - 公式计算器 `evaluateGapFormula`
  - 单位换算 `convertQuantity` / `parseConversionFactor`
- `apps/api`
  - Prisma 数据模型：User / ProductMaster / FieldMeta / UnitConversion / ReplacementRule / FormulaProfile / ScopeProfile / RuleRelease / AuditLog
  - 发布包聚合：`fieldDictionary`、`formulaProfiles`、`replacementRules`、`productSnapshot`、`checksum`
- `apps/admin-web`
  - 全部字段选择器统一使用共享格式 `中文名（key）`
  - tooltip 优先展示 `descriptionZh`

## 3. 默认业务逻辑落地
- 默认库存字段：`instantqty`
- 默认公式：`缺口 = 需求 - 已执行 - 采购订单入库 - 即时库存`
- 缺口阈值：`> 0`
- 单位比较默认统一为基本单位
