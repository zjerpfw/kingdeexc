import { getCache, setCache } from '../state/cache';

export async function renderSettingsPanel() {
  const cache = await getCache();
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;bottom:12px;right:8px;z-index:999999;background:#fff;border:1px solid #ddd;padding:10px;width:320px;font-size:12px';
  box.innerHTML = `
    <div><b>插件设置</b></div>
    <div>规则包版本：${cache.version || '-'}</div>
    <div>上次同步时间：${cache.lastSyncAt || '-'}</div>
    <div>当前启用公式模板：${cache.rulePackage?.formulaProfiles?.[0]?.name || '-'}</div>
    <label><input id="k-auto" type="checkbox" ${cache.settings.autoPopup ? 'checked' : ''}/> 自动弹窗</label><br/>
    <label><input id="k-only" type="checkbox" ${cache.settings.onlyFullyCover ? 'checked' : ''}/> 仅显示可完整覆盖</label><br/>
    <label><input id="k-fail" type="checkbox" ${cache.settings.showWhenConversionFailed ? 'checked' : ''}/> 换算失败仍显示</label>
  `;
  document.body.appendChild(box);

  (['k-auto', 'k-only', 'k-fail'] as const).forEach((id) => {
    box.querySelector<HTMLInputElement>(`#${id}`)?.addEventListener('change', async () => {
      await setCache({ settings: { autoPopup: !!box.querySelector<HTMLInputElement>('#k-auto')?.checked, onlyFullyCover: !!box.querySelector<HTMLInputElement>('#k-only')?.checked, showWhenConversionFailed: !!box.querySelector<HTMLInputElement>('#k-fail')?.checked } });
    });
  });
}
