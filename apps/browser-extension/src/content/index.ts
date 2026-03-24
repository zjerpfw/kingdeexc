import { installFetchHook } from './fetch-hook';
import { parseInventoryRows } from './parsers/inventory-parser';
import { parseOrderRows } from './parsers/order-parser';
import { getLatestRulePackage } from './services/rule-package-service';
import { buildDecisions } from './services/decision-engine';
import { getCache, setCache } from './state/cache';
import { renderSuggestions } from './ui/suggestion-panel';
import { renderSettingsPanel } from './ui/settings-panel';

async function handleInventory(payload: any) {
  const { rows, warnings } = parseInventoryRows(payload);
  if (warnings.length) console.warn('[kingdee-plugin] inventory warnings', warnings);
  const pool: Record<string, any> = {};
  rows.forEach((r) => (pool[r.productCode] = r));
  const cache = await getCache();
  await setCache({
    inventoryPool: pool,
    debug: {
      ...(cache.debug || { orderApiHits: 0, inventoryApiHits: 0, lastDecisionCount: 0 }),
      inventoryApiHits: (cache.debug?.inventoryApiHits || 0) + 1,
      lastParsedInventoryRows: rows,
    },
  });
}

async function handleOrder(payload: any) {
  const { rows, warnings } = parseOrderRows(payload);
  if (warnings.length) console.warn('[kingdee-plugin] order warnings', warnings);
  const rulePackage = await getLatestRulePackage();
  const cache = await getCache();
  if (!rulePackage) return;
  const decisions = buildDecisions({ orders: rows, inventoryPool: cache.inventoryPool, rulePackage, settings: cache.settings });
  await setCache({
    debug: {
      ...(cache.debug || { orderApiHits: 0, inventoryApiHits: 0, lastDecisionCount: 0 }),
      orderApiHits: (cache.debug?.orderApiHits || 0) + 1,
      lastDecisionCount: decisions.length,
      lastParsedOrderRows: rows,
      lastDecisions: decisions,
    },
  });
  if (cache.settings.autoPopup) renderSuggestions(decisions);
}

void renderSettingsPanel();
installFetchHook((data) => void handleInventory(data), (data) => void handleOrder(data));
