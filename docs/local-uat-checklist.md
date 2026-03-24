# 本地 UAT 验收清单（local-uat-checklist）

## 1. 管理后台验收步骤
1. 登录后台，确认菜单包含：仪表盘/商品主数据/字段字典/替代规则/公式模板/发布管理/审计日志/联调模拟页/验收检查页。
2. 在字段字典页检查字段显示格式是否为 `中文名（key）`。
3. 检查 tooltip：
   - 有说明时展示中文说明
   - 无说明时展示“暂无官方中文说明，可在后台维护别名”
4. 在商品主数据页检查 `manualReviewRequired` 标签。

## 2. 发布包验收步骤
1. 在发布管理点击“发布”。
2. 调用 `GET /api/releases/latest`，核对 payload 包含：
   - version
   - releasedAt
   - fieldDictionary
   - formulaProfiles
   - replacementRules
   - productSnapshot
   - checksum
3. 执行一次回滚并检查 history 列表。

## 3. 插件验收步骤
1. 加载 MV3 扩展。
2. 打开设置面板检查：
   - 命中订单接口次数
   - 命中库存接口次数
   - 最近规则同步时间
   - 最近决策结果条数
3. 测试按钮：
   - 导出最近解析结果 JSON
   - 导出最近计算过程 JSON
   - 强制刷新规则包缓存
4. 检查建议面板空值文案是否为“暂无数据”。

## 4. 金蝶真实页面验收步骤
1. 进入 `https://tf.jdy.com/*`。
2. 触发库存接口（`inv_inventory_rpt`）并确认库存命中计数 +1。
3. 触发订单接口（`f=sal_bill_order&ac=loadData`）并确认订单命中计数 +1。
4. 校验缺口>0时是否出现替代建议。
5. 校验“查看计算过程”是否显示中文字段名（`中文名（key）`）。

## 5. 常见错误与排查方法
- `pnpm install` 失败：检查代理/防火墙，先运行 `scripts/check-env.js`。
- API 无法连接数据库：检查 `.env` 中 `DATABASE_URL` 和 `docker compose ps`。
- 插件无建议：检查是否有已发布规则包、订单接口是否命中、公式阈值是否过高。
- 换算异常：检查 `conversionrate` 文本格式及是否落入 `manualReviewRequired`。

## 6. 必须人工确认场景
- 包含 `≈`、`约`、非标准写法的换算公式。
- 插件显示“换算公式需人工确认”或“无法换算（需人工确认）”的建议行。
- 缺少官方中文说明字段（需在后台维护别名）。
