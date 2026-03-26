function readUrl(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input && typeof input === 'object' && 'url' in input) return String((input as { url?: string }).url || '');
  return '';
}

function handlePayload(url: string, payload: unknown, onInventory: (json: any) => void, onOrder: (json: any) => void) {
  const shouldInventory = url.includes('inv_inventory_rpt');
  const shouldOrder = url.includes('f=sal_bill_order') && url.includes('ac=loadData');
  if (shouldInventory) onInventory(payload);
  if (shouldOrder) onOrder(payload);
}

export function installFetchHook(onInventory: (json: any) => void, onOrder: (json: any) => void) {
  const rawFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const res = await rawFetch(...args);
    try {
      const url = readUrl(args[0]);
      const shouldHandle = url.includes('inv_inventory_rpt') || (url.includes('f=sal_bill_order') && url.includes('ac=loadData'));
      if (shouldHandle) {
        const clone = res.clone();
        clone
          .json()
          .then((data) => {
            handlePayload(url, data, onInventory, onOrder);
          })
          .catch(() => undefined);
      }
    } catch {
      // ignore
    }
    return res;
  };

  const rawOpen = XMLHttpRequest.prototype.open;
  const rawSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function open(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
    (this as XMLHttpRequest & { __kingdeeUrl?: string }).__kingdeeUrl = String(url || '');
    return rawOpen.call(this, method, url, async ?? true, username ?? null, password ?? null);
  };

  XMLHttpRequest.prototype.send = function send(body?: Document | XMLHttpRequestBodyInit | null) {
    this.addEventListener('load', () => {
      try {
        const url = (this as XMLHttpRequest & { __kingdeeUrl?: string }).__kingdeeUrl || '';
        const shouldHandle = url.includes('inv_inventory_rpt') || (url.includes('f=sal_bill_order') && url.includes('ac=loadData'));
        if (!shouldHandle || !this.responseText) return;
        const parsed = JSON.parse(this.responseText);
        handlePayload(url, parsed, onInventory, onOrder);
      } catch {
        // ignore
      }
    });

    return rawSend.call(this, body);
  };
}
