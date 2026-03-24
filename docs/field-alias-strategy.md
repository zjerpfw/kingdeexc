# 字段别名策略

- 字段展示统一 `中文名（key）`。
- 中文名来源优先级：
  1) 中心服务 `/api/field-meta` 的 `labelZh`
  2) 共享字典默认值
  3) 回退为 key
- tooltip 优先使用 `descriptionZh`。
- 示例：`即时库存（instantqty）`、`行已执行数量（out_qty）`、`采购订单入库数量（purordinqty）`。
