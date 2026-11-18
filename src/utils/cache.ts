interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number;
}

/** In-memory cache with TTL support */
export class MemoryCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  /** Get a cached value if it exists and hasn't expired */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  /** Store a value with the given TTL in milliseconds */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /** Check if a non-expired entry exists */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /** Remove all entries */
  clear(): void {
    this.store.clear();
  }
}

/** SessionStorage-backed cache with TTL */
export class SessionCache {
  private readonly prefix: string;

  constructor(prefix = 'saans_cache_') {
    this.prefix = prefix;
  }

  get<T>(key: string): T | null {
    try {
      const raw = sessionStorage.getItem(this.prefix + key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (Date.now() > entry.expiresAt) {
        sessionStorage.removeItem(this.prefix + key);
        return null;
      }
      return entry.value;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    try {
      const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
      sessionStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch {
      // sessionStorage may be full or unavailable
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k?.startsWith(this.prefix)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      // ignore
    }
  }
}

/**
 * Combined cache: checks in-memory first, then sessionStorage.
 * Writes to both layers on set.
 */
export class AqiCache {
  private readonly memory = new MemoryCache();
  private readonly session = new SessionCache('saans_aqi_');

  get<T>(key: string): T | null {
    const memVal = this.memory.get<T>(key);
    if (memVal !== null) return memVal;
    const sessVal = this.session.get<T>(key);
    if (sessVal !== null) {
      // Promote back to memory
      this.memory.set(key, sessVal, 0);
    }
    return sessVal;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.memory.set(key, value, ttlMs);
    this.session.set(key, value, ttlMs);
  }

  has(key: string): boolean {
    return this.memory.has(key) || this.session.has(key);
  }

  clear(): void {
    this.memory.clear();
    this.session.clear();
  }
}

/** Singleton AQI cache instance */
export const aqiCache = new AqiCache();
