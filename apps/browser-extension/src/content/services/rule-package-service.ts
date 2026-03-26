import type { RulePackage, RuleReleaseEnvelope } from '@kingdee/shared';
import { getCache, setCache } from '../state/cache';

const API_BASE_CANDIDATES = ['http://localhost:3000/api', 'http://127.0.0.1:3000/api'];

export async function getLatestRulePackage(): Promise<RulePackage | undefined> {
  const cache = await getCache();
  for (const apiBase of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${apiBase}/releases/latest`);
      if (!res.ok) continue;
      const data = (await res.json()) as RuleReleaseEnvelope;
      const payload = data?.payloadJson as RulePackage | undefined;
      if (!payload) continue;

      const isNew = cache.version !== payload.version;
      if (isNew) await setCache({ version: payload.version, lastSyncAt: new Date().toISOString(), rulePackage: payload });

      return payload;
    } catch {
      // try next candidate
    }
  }

  return cache.rulePackage;
}
