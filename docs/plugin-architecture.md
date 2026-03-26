# 插件架构（MV3）

- 运行形态：Chrome/Edge Manifest V3 content script。
- 拦截方式：重写 `window.fetch`，只监听 `inv_inventory_rpt` 与 `f=sal_bill_order&ac=loadData`。
- 数据流：接口响应 -> parser 标准化 -> 拉取规则包 -> 决策引擎 -> 建议面板。
- 缓存：`chrome.storage.local`（降级 `localStorage`），包含规则包版本、库存池、设置项。
- UI：右侧建议面板 + 右下设置面板（中文文案）。
