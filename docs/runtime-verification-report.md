# 真实运行检验报告（第四轮）

日期：2026-03-24（UTC）
模式：真实运行检验（优先安装、运行、测试、修复）

---

## 1) 环境检查结果

### 执行命令与结果
1. `node -v`
- 结果：`v20.19.6`（通过）

2. `pnpm -v`
- 结果：失败（corepack 尝试下载 pnpm 包时被代理 403 拒绝）
- 摘要：`Proxy response (403) !== 200 when HTTP Tunneling`

3. `docker compose ps`
- 结果：失败
- 摘要：`docker: command not found`

4. `.env` 检查
- 结果：`.env` 缺失，`.env.example` 存在且字段完整：
  - `DATABASE_URL`
  - `API_PORT`
  - `VITE_API_BASE_URL`

5. 配置一致性检查（静态）
- 结果：通过，关键配置文件存在：
  - `pnpm-workspace.yaml`
  - `apps/api/{package.json,tsconfig.json,nest-cli.json,prisma/schema.prisma}`
  - `apps/admin-web/{package.json,tsconfig.json,vite.config.ts}`
  - `apps/browser-extension/{package.json,tsconfig.json,vite.config.ts}`
  - `packages/shared/{package.json,tsconfig.json}`

---

## 2) 安装与初始化执行

### 2.1 `pnpm install`
- 结果：失败
- 问题 -> 原因 -> 修复方案
  - 问题：无法安装依赖
  - 原因：corepack 需联网下载 pnpm（`pnpm@9.12.3`），当前代理返回 403
  - 修复方案：
    1. 在可联网环境预装 pnpm（或镜像仓库）
    2. 配置可用 npm registry/proxy
    3. 再执行 `pnpm install`

### 2.2 数据库初始化 / migrate / seed
- 结果：未执行
- 阻塞原因：
  1. `pnpm install` 未成功
  2. `docker` 不可用，PostgreSQL 容器无法启动

---

## 3) 构建、测试、lint/typecheck

目标命令（计划执行）：
- `pnpm -r build`
- `pnpm -r test`
- `pnpm -r lint`

实际结果：未执行（同上游阻塞：pnpm 不可用）。

---

## 4) 服务启动与产物检查

目标：启动 API / Admin，构建 Extension。
实际：未执行（pnpm/dockers 阻塞）。

---

## 5) 最小闭环验收（当前环境）

### A. 已实际跑通
- Node 版本检查
- 配置文件存在性与 workspace 结构静态检查
- 环境检测脚本可运行：`node scripts/check-env.js`

### B. 已修复问题
- 无新增代码逻辑修复（本轮按“先跑再修”执行，实际阻塞在环境层）。
- 已形成可执行阻塞定位结论与下一步方案。

### C. 仍未解决问题
1. `pnpm` 无法获取（corepack 下载被代理拦截 403）
2. `docker` 不存在（数据库容器无法启动）
3. 因 1+2 导致 build/test/start/seed 全链路无法执行

### D. 需要人工现场验证的问题
1. API 启动与路由连通性
2. `/acceptance-check` 页面真实数据加载
3. seed 后实体数量（字段字典/商品/规则/模板/发布/审计）
4. latest release 包结构实际返回
5. 插件构建产物、content script 注入与 fetch hook 在 tf.jdy.com 页面行为

---

## 6) 建议的现场执行顺序（联网 + Docker 可用）
1. `pnpm run check:env`
2. `pnpm run dev:init`
3. `pnpm -r build`
4. `pnpm -r test`
5. `pnpm -r lint`
6. `pnpm --filter @kingdee/api dev`
7. `pnpm --filter @kingdee/admin-web dev`
8. `pnpm --filter @kingdee/browser-extension build`
9. 打开后台 `/acceptance-check` 并按 `docs/local-uat-checklist.md` 验收
