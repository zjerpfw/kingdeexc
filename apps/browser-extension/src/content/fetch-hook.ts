export function installFetchHook(onInventory: (json: any) => void, onOrder: (json: any) => void) {
  const rawFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const res = await rawFetch(...args);
    try {
      const url = String(args[0]);
      const shouldInventory = url.includes('inv_inventory_rpt');
      const shouldOrder = url.includes('f=sal_bill_order') && url.includes('ac=loadData');
      if (shouldInventory || shouldOrder) {
        const clone = res.clone();
        clone
          .json()
          .then((data) => {
            if (shouldInventory) onInventory(data);
            if (shouldOrder) onOrder(data);
          })
          .catch(() => undefined);
      }
    } catch {
      // ignore
    }
    return res;
  };
}
