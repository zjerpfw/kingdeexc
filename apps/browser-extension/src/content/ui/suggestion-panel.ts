import type { GapDecision } from '@kingdee/shared';

let panel: HTMLDivElement | null = null;

function ensurePanel() {
  if (panel) return panel;
  panel = document.createElement('div');
  panel.id = 'kingdee-suggestion-panel';
  panel.style.cssText = 'position:fixed;top:80px;right:8px;z-index:999999;background:#fff;border:1px solid #ddd;width:420px;max-height:80vh;overflow:auto;padding:10px;box-shadow:0 2px 8px rgba(0,0,0,.15)';
  document.body.appendChild(panel);
  return panel;
}

export function renderSuggestions(decisions: GapDecision[]) {
  const el = ensurePanel();
  if (!decisions.length) {
    el.innerHTML = '<b>替代建议</b><div>当前无缺口建议。</div>';
    return;
  }
  el.innerHTML = `<b>替代建议</b>${decisions
    .map((d) => `
      <div style="border-top:1px solid #eee;padding-top:8px;margin-top:8px;">
        <div><b>${d.productName}</b>（${d.productCode}）</div>
        <div>当前单位：${d.orderUnit || '-'}；基本单位：${d.baseUnit || '-'}</div>
        <div>需求数量(基本)：${d.demandBase}，已执行：${d.executedBase}，库存：${d.inventoryBase}，缺口：<b style="color:#cf1322">${d.gapBase}</b></div>
        <div>公式模板：${d.formulaName}</div>
        ${d.warnings.map((w) => `<div style="color:#d48806">⚠ ${w}</div>`).join('')}
        <details><summary>查看计算过程</summary>${d.calculationSteps.map((s) => `<div>${s.label} | 原始值:${s.rawValue ?? '-'} ${s.unit ?? ''} | 换算后:${s.normalizedValue}</div>`).join('')}</details>
        <div>${d.suggestions.map((s) => `<div style="margin-top:6px;padding:6px;background:#fafafa">替代商品：${s.targetProductName}（${s.targetProductCode}）<br/>仓库：${s.warehouseName || '-'}<br/>基本单位库存：${s.baseInventory}<br/>按当前下单单位可覆盖：${s.coverageInOrderUnit?.toFixed(2) || '-'}<br/>${s.canFullyCover ? '可完整覆盖' : '不可完整覆盖'}</div>`).join('')}</div>
      </div>
    `)
    .join('')}`;
}
