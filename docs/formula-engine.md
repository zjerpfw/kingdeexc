# 公式引擎说明

## 核心能力
1. 字段拼装器选择字段后生成内部 `configJson`。
2. `evaluateGapFormula(config,row)` 计算缺口。
3. `shouldTriggerReplacement(gap, threshold)` 判断是否触发替代建议。

## 内置模板
1. 基础缺口
2. 考虑采购入库
3. 考虑在途与占用

## 单位换算策略
1. 优先 `baseqty`
2. 同单位直接返回
3. 无 baseqty 时尝试 `qty * conversionrate factor`
4. 解析失败返回 `manualReviewRequired=true`
