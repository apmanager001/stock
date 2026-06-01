type MemoryCacheEntry<T> = {
  value?: T;
  expiresAt: number;
  inFlight?: Promise<T>;
};

type MemoryCacheStore = Map<string, MemoryCacheEntry<unknown>>;

type GlobalMemoryCache = typeof globalThis & {
  __memoryCacheStores?: Map<string, MemoryCacheStore>;
};

const globalMemoryCache = globalThis as GlobalMemoryCache;

function getMemoryCacheStores() {
  if (!globalMemoryCache.__memoryCacheStores) {
    globalMemoryCache.__memoryCacheStores = new Map();
  }

  return globalMemoryCache.__memoryCacheStores;
}

function getMemoryCacheStore(cacheName: string) {
  const stores = getMemoryCacheStores();
  const existingStore = stores.get(cacheName);

  if (existingStore) {
    return existingStore;
  }

  const nextStore: MemoryCacheStore = new Map();
  stores.set(cacheName, nextStore);
  return nextStore;
}

function pruneExpiredEntries(store: MemoryCacheStore, now: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.inFlight || entry.expiresAt > now) {
      continue;
    }

    store.delete(key);
  }
}

type GetCachedValueOptions<T> = {
  cacheName: string;
  key: string;
  ttlMs: number;
  loader: () => Promise<T>;
};

export async function getCachedValue<T>({
  cacheName,
  key,
  ttlMs,
  loader,
}: GetCachedValueOptions<T>) {
  if (ttlMs <= 0) {
    return loader();
  }

  const store = getMemoryCacheStore(cacheName);
  const now = Date.now();
  pruneExpiredEntries(store, now);

  const existingEntry = store.get(key) as MemoryCacheEntry<T> | undefined;

  if (existingEntry?.value !== undefined && existingEntry.expiresAt > now) {
    return existingEntry.value;
  }

  if (existingEntry?.inFlight) {
    return existingEntry.inFlight;
  }

  const inFlight = loader()
    .then((value) => {
      store.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });

      return value;
    })
    .catch((error) => {
      store.delete(key);
      throw error;
    });

  store.set(key, {
    expiresAt: now + ttlMs,
    inFlight,
  });

  return inFlight;
}

export function clearCachedValues(
  cacheName: string,
  predicate?: (key: string) => boolean,
) {
  const store = getMemoryCacheStores().get(cacheName);

  if (!store) {
    return;
  }

  if (!predicate) {
    store.clear();
    return;
  }

  for (const key of store.keys()) {
    if (predicate(key)) {
      store.delete(key);
    }
  }
}