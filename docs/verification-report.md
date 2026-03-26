# 第三轮收口与验收报告（verification-report）

## 0. 样例文件复读确认
已再次读取并核对：
- `spec/samples/库存查询表返回数据.txt`
- `spec/samples/订单详情返回数据.txt`

用于本轮字段中文显示、换算逻辑、公式字段回退策略修正。

## 1. 工程一致性检查

### 1.1 配置文件存在性与结构
已确认 monorepo 关键配置文件完整：
- workspace：`pnpm-workspace.yaml`
- API：`apps/api/package.json`、`apps/api/tsconfig.json`、`apps/api/nest-cli.json`、`apps/api/prisma/schema.prisma`
- Admin：`apps/admin-web/package.json`、`apps/admin-web/tsconfig.json`、`apps/admin-web/vite.config.ts`
- Extension：`apps/browser-extension/package.json`、`apps/browser-extension/tsconfig.json`、`apps/browser-extension/vite.config.ts`
- Shared：`packages/shared/package.json`、`packages/shared/tsconfig.json`

### 1.2 import path / alias / 构建脚本检查结论
- `@kingdee/shared` 在 admin/api/extension 均被统一使用。
- `packages/shared/src/index.ts` 已导出插件所需子模块（`plugin-types` / `field-dictionary` / `formula-engine` / `unit-conversion`）。
- 发现并修复发布包结构不一致：API 发布 payload 之前缺少 `checksum` 字段，本轮已补齐至 `payloadJson`。

### 1.3 编译风险静态扫描（无联网）
由于 `pnpm` 下载安装受限，无法执行真实编译；改为静态检查并修复：
1. 字段 tooltip fallback 文案统一。
2. 决策引擎使用 `inventoryPool` 兜底库存，避免参数闲置和逻辑断链。
3. release 类型增加 `RuleReleaseEnvelope`，统一 API/插件消费。
4. 公式与换算测试补充更多边界。

## 2. 本轮关键修复

### 2.1 字段中文显示体验
- 统一规则：`中文名（key）`。
- tooltip 无官方说明时显示：`暂无官方中文说明，可在后台维护别名`。
- 覆盖后台字段字典页、公式选择器、插件计算过程、插件设置面板模板字段展示。

### 2.2 单位换算与公式引擎
- 增强 `conversionrate` 解析：支持 `=` / `＝` / `≈` / `约` / 空格差异。
- 保留 `baseqty` 优先、同单位直返、`qty*factor` 兜底、失败 warning。
- 决策引擎补充 `out_qty` / `purordinqty` / `purtransitqty` 基本单位换算逻辑。

### 2.3 发布包一致性
- 发布 payload 结构统一：
  - `version`
  - `releasedAt`
  - `fieldDictionary`
  - `formulaProfiles`
  - `replacementRules`
  - `productSnapshot`
  - `checksum`
- 插件消费 `GET /api/releases/latest` 时按 `RuleReleaseEnvelope.payloadJson` 读取。

### 2.4 演示闭环数据
Seed 已补全：
- 5 个商品
- 2+ 组替代关系
- 3 套公式模板
- 1 个已发布版本（`v-seed-initial`）
- 1 条审计日志
- 含 `≈` 换算样例

## 3. 未验证风险清单
受环境网络限制，以下未能真实运行验证：
1. `pnpm install` 无法完成，导致无法执行 TypeScript 编译和 Vitest。
2. API 与前端/插件未完成进程级联调（仅静态审查）。
3. 浏览器扩展未在真实 `tf.jdy.com` 页面进行拦截验证。
4. Prisma migration / seed 未在本环境真实跑库验证。

## 4. 建议后续立即执行（联网环境）
1. `pnpm install`
2. `pnpm -r test`
3. `pnpm --filter @kingdee/api prisma:generate && pnpm --filter @kingdee/api prisma:migrate --name init && pnpm --filter @kingdee/api seed`
4. `pnpm dev`
5. `pnpm --filter @kingdee/browser-extension build` 并在 Chrome/Edge 开发者模式加载 `dist/`


## 5. 第四轮补充（本地联调支持）
- 新增脚本：`scripts/check-env.js`、`scripts/dev-init.js`、`scripts/dev-reset.js`。
- 新增后台“验收检查页”（`/acceptance-check`）。
- 插件设置面板新增联调统计、导出 JSON、强制刷新规则包缓存。
