# 本地演示最小闭环（demo-walkthrough）

## 1. 启动数据库
```bash
docker compose up -d
```

## 2. 准备环境变量
```bash
cp .env.example .env
```

## 3. 初始化数据库并导入种子
```bash
pnpm --filter @kingdee/api prisma:generate
pnpm --filter @kingdee/api prisma:migrate --name init
pnpm --filter @kingdee/api seed
```

## 4. 启动 API 与后台
```bash
pnpm --filter @kingdee/api dev
pnpm --filter @kingdee/admin-web dev
```

## 5. 构建并加载浏览器扩展
```bash
pnpm --filter @kingdee/browser-extension build
```
打开 Chrome/Edge：
- 进入扩展管理页面
- 打开开发者模式
- 加载已解压扩展：`apps/browser-extension/dist`

## 6. 在金蝶页面验证插件行为
目标页面：`https://tf.jdy.com/*`

期望行为：
1. 命中 `inv_inventory_rpt` 接口时，库存池缓存更新。
2. 命中 `f=sal_bill_order&ac=loadData` 接口时，插件读取最新规则包并计算缺口。
3. 缺口 > 0 时右侧面板展示替代建议。
4. 若换算失败显示“换算公式需人工确认”。

## 7. 无真实金蝶环境时的模拟验证
使用后台“联调模拟页”：
- 菜单：`联调模拟页`
- 粘贴库存 JSON 与订单 JSON（可直接用 `spec/samples` 字段）
- 选择公式模板
- 运行后查看：字段值、公式计算、缺口结果

## 8. 推荐验收样例
- 订单：`qty=3`、`unit=箱`、`baseunit=副`、`conversionrate=1 箱 = 180 副`
- 校验：`out_qty/purordinqty/purtransitqty` 能正确转基本单位
- 替代：检查优先级排序与完整覆盖标记
