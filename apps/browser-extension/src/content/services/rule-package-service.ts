import type { RulePackage, RuleReleaseEnvelope } from '@kingdee/shared';
import { getCache, setCache } from '../state/cache';

const API_BASE = 'http://localhost:3000/api';

export async function getLatestRulePackage(): Promise<RulePackage | undefined> {
  const cache = await getCache();
  try {
    const res = await fetch(`${API_BASE}/releases/latest`);
    if (!res.ok) throw new Error('网络失败');
    const data = (await res.json()) as RuleReleaseEnvelope;
    const payload = data?.payloadJson as RulePackage | undefined;
    if (!payload) return cache.rulePackage;

    const isNew = cache.version !== payload.version;
    if (isNew) await setCache({ version: payload.version, lastSyncAt: new Date().toISOString(), rulePackage: payload });

    return payload;
  } catch {
    return cache.rulePackage;
  }
}
