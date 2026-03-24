# 金蝶精斗云库存替代决策中心

## 项目结构
- `apps/api`: NestJS + Prisma + PostgreSQL
- `apps/admin-web`: React + Vite + Ant Design
- `apps/browser-extension`: Chrome/Edge MV3 插件（content script + 决策引擎）
- `packages/shared`: 共享类型、字段字典、公式与换算能力

## 快速启动
1. 安装依赖
```bash
pnpm install
```
2. 启动 PostgreSQL
```bash
docker compose up -d
```
3. 环境变量
```bash
cp .env.example .env
```
4. 初始化数据库并导入种子
```bash
pnpm --filter @kingdee/api prisma:generate
pnpm --filter @kingdee/api prisma:migrate --name init
pnpm --filter @kingdee/api seed
```
5. 启动 API + 后台
```bash
pnpm dev
```
6. 构建浏览器插件
```bash
pnpm --filter @kingdee/browser-extension build
```
> 构建产物在 `apps/browser-extension/dist`，在 Chrome/Edge 开发者模式中加载该目录。

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
