import type { GapDecision, NormalizedInventoryRow, PluginSettings, RulePackage } from '@kingdee/shared';

const KEY = 'kingdee-plugin-cache';

export interface PluginCache {
  version?: string;
  lastSyncAt?: string;
  rulePackage?: RulePackage;
  inventoryPool: Record<string, NormalizedInventoryRow>;
  settings: PluginSettings;
  debug?: {
    orderApiHits: number;
    inventoryApiHits: number;
    lastDecisionCount: number;
    lastParsedOrderRows?: unknown;
    lastParsedInventoryRows?: unknown;
    lastDecisions?: GapDecision[];
  };
}

const defaultCache: PluginCache = {
  inventoryPool: {},
  settings: { autoPopup: true, onlyFullyCover: false, showWhenConversionFailed: true },
  debug: { orderApiHits: 0, inventoryApiHits: 0, lastDecisionCount: 0 },
};

export async function getCache(): Promise<PluginCache> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const data = await chrome.storage.local.get(KEY);
    return { ...defaultCache, ...(data[KEY] || {}) };
  }
  const raw = localStorage.getItem(KEY);
  return raw ? { ...defaultCache, ...JSON.parse(raw) } : defaultCache;
}

export async function setCache(patch: Partial<PluginCache>): Promise<PluginCache> {
  const next = { ...(await getCache()), ...patch };
  if (typeof chrome !== 'undefined' && chrome.storage?.local) await chrome.storage.local.set({ [KEY]: next });
  else localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
