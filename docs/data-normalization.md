# 数据标准化说明

## 库存报表
解析字段：materialid_number/materialid_name/stockid_number/stockid_name/baseunit_id/auxunitid_id/deffloatunit_id/conversionrate/qty/validqty/auxqty/validauxqty。

## 订单详情
解析字段：materialid/material_name/stockid/unit/qty/baseunit/baseqty/auxunitid/auxqty/conversionrate/inv_qty/instantqty/expvalidqty/saloccupyqty/out_qty/pick_qty/pick_out_qty/pick_baseqty/pick_out_baseqty/purrequestqty/purordqty/purordinqty/purtransitqty。

## 统一规则
- 优先 baseqty / pick_out_baseqty。
- 否则 qty + conversionrate 换算。
- 解析失败打 warning，不直接崩溃。
