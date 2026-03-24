# 金蝶精斗云库存替代决策中心

## 项目结构
- `apps/api`: NestJS + Prisma + PostgreSQL
- `apps/admin-web`: React + Vite + Ant Design
- `apps/browser-extension`: Chrome/Edge MV3 插件（content script + 决策引擎）
- `packages/shared`: 共享类型、字段字典、公式与换算能力

## 从零启动（推荐）
### 版本要求
- Node.js: `>=20`（建议 20 LTS）
- pnpm: `9.x`
- Docker + Docker Compose

### 1) 环境检查
```bash
pnpm run check:env
```

### 2) 一键初始化
```bash
pnpm run dev:init
```
该命令会执行：
- `docker compose up -d`
- `pnpm install`
- Prisma generate / migrate
- seed 导入

### 3) 启动开发
```bash
pnpm dev
```

### 4) 构建插件
```bash
pnpm --filter @kingdee/browser-extension build
```
构建产物：`apps/browser-extension/dist`。

### 5) 一键重置（清库重建）
```bash
pnpm run dev:reset
```

## Windows 说明
- 可直接使用 Node 运行脚本：
  - `node scripts/check-env.js`
  - `node scripts/dev-init.js`
  - `node scripts/dev-reset.js`
- Docker Desktop 需先启动。
- 推荐在 PowerShell 中执行上述命令。

## 手动启动步骤（备用）
1. `docker compose up -d`
2. `cp .env.example .env`
3. `pnpm install`
4. `pnpm --filter @kingdee/api prisma:generate`
5. `pnpm --filter @kingdee/api prisma:migrate --name init`
6. `pnpm --filter @kingdee/api seed`
7. `pnpm --filter @kingdee/api dev`
8. `pnpm --filter @kingdee/admin-web dev`
9. `pnpm --filter @kingdee/browser-extension build`

## 核心 API
- `GET /api/field-meta`
- `PUT /api/field-meta/:id`
- `GET /api/products`
- `GET /api/products/search`
- `GET /api/replacement-rules`
- `POST /api/replacement-rules`
- `PUT /api/replacement-rules/:id`
- `DELETE /api/replacement-rules/:id`
- `GET /api/formula-profiles`
- `POST /api/formula-profiles`
- `PUT /api/formula-profiles/:id`
- `POST /api/releases/publish`
- `GET /api/releases/latest`
- `GET /api/releases/history`
- `POST /api/releases/:version/rollback`
- `GET /api/audit-logs`

## 文档
- `docs/architecture.md`
- `docs/field-dictionary.md`
- `docs/formula-engine.md`
- `docs/plugin-architecture.md`
- `docs/data-normalization.md`
- `docs/field-alias-strategy.md`
- `docs/verification-report.md`
- `docs/demo-walkthrough.md`
- `docs/release-readiness.md`

- `docs/local-uat-checklist.md`

- `docs/runtime-verification-report.md`
