import { getFieldLabel } from '@kingdee/shared';
import { getLatestRulePackage } from '../services/rule-package-service';
import { getCache, setCache } from '../state/cache';

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function renderSettingsPanel() {
  const cache = await getCache();
  const formula = cache.rulePackage?.formulaProfiles?.[0];
  const fieldDesc = formula
    ? [formula.configJson.demandFieldKey, formula.configJson.executedFieldKey, formula.configJson.purchaseInboundFieldKey, formula.configJson.purchaseTransitFieldKey, formula.configJson.instantInventoryFieldKey]
        .filter(Boolean)
        .map((k: string) => `<li>${getFieldLabel('sales_order_detail', k)}</li>`)
        .join('')
    : '<li>-</li>';

  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;bottom:12px;right:8px;z-index:999999;background:#fff;border:1px solid #ddd;padding:10px;width:380px;font-size:12px';
  box.innerHTML = `
    <div><b>插件设置</b></div>
    <div>规则包版本：${cache.version || '-'}</div>
    <div>最近规则同步时间：${cache.lastSyncAt || '-'}</div>
    <div>当前启用公式模板：${formula?.name || '-'}</div>
    <div>命中订单接口次数：${cache.debug?.orderApiHits || 0}</div>
    <div>命中库存接口次数：${cache.debug?.inventoryApiHits || 0}</div>
    <div>最近一次决策结果条数：${cache.debug?.lastDecisionCount || 0}</div>
    <div>模板字段说明：<ul>${fieldDesc}</ul></div>
    <label><input id="k-auto" type="checkbox" ${cache.settings.autoPopup ? 'checked' : ''}/> 自动弹窗</label><br/>
    <label><input id="k-only" type="checkbox" ${cache.settings.onlyFullyCover ? 'checked' : ''}/> 仅显示可完整覆盖</label><br/>
    <label><input id="k-fail" type="checkbox" ${cache.settings.showWhenConversionFailed ? 'checked' : ''}/> 换算失败仍显示建议</label>
    <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
      <button id="btn-export-parse">导出最近解析结果 JSON</button>
      <button id="btn-export-calc">导出最近计算过程 JSON</button>
      <button id="btn-refresh-rule">强制刷新规则包缓存</button>
    </div>
  `;
  document.body.appendChild(box);

  (['k-auto', 'k-only', 'k-fail'] as const).forEach((id) => {
    box.querySelector<HTMLInputElement>(`#${id}`)?.addEventListener('change', async () => {
      await setCache({ settings: { autoPopup: !!box.querySelector<HTMLInputElement>('#k-auto')?.checked, onlyFullyCover: !!box.querySelector<HTMLInputElement>('#k-only')?.checked, showWhenConversionFailed: !!box.querySelector<HTMLInputElement>('#k-fail')?.checked } });
    });
  });

  box.querySelector('#btn-export-parse')?.addEventListener('click', async () => {
    const c = await getCache();
    downloadJson('kingdee-last-parse.json', { orderRows: c.debug?.lastParsedOrderRows || [], inventoryRows: c.debug?.lastParsedInventoryRows || [] });
  });

  box.querySelector('#btn-export-calc')?.addEventListener('click', async () => {
    const c = await getCache();
    downloadJson('kingdee-last-decisions.json', c.debug?.lastDecisions || []);
  });

  box.querySelector('#btn-refresh-rule')?.addEventListener('click', async () => {
    const payload = await getLatestRulePackage();
    if (payload) {
      await setCache({ version: payload.version, lastSyncAt: new Date().toISOString(), rulePackage: payload });
      alert('规则包已刷新');
      box.remove();
      void renderSettingsPanel();
    }
  });
}
