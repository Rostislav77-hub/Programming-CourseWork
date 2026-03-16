function createLRU() {
  return {
    onGet(key, cache) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
    },
    onSet(_key, _cache) {},

    evict(cache) {
      const lruKey = cache.keys().next().value;
      cache.delete(lruKey);
      console.log(`[evict LRU] removed key=${lruKey}`);
    },
  };
}
function createLFU() {
  const freq = new Map();

  return {
    onGet(key, _cache) {
      freq.set(key, (freq.get(key) ?? 0) + 1);
    },
    onSet(key, _cache) {
      freq.set(key, 1);
    },
    evict(cache) {
      let lfuKey = null;
      let minFreq = Infinity;

      for (const [key, count] of freq) {
        if (count < minFreq) {
          minFreq = count;
          lfuKey = key;
        }
      }

      cache.delete(lfuKey);
      freq.delete(lfuKey);
      console.log(`[evict LFU] removed key=${lfuKey} (freq=${minFreq})`);
    },
  };
}
function createTTL(ttlMs = 5000) {
  const timestamps = new Map();

  return {
    onGet(_key, _cache) {},

    onSet(key, _cache) {
      timestamps.set(key, Date.now());
    },

    evict(cache) {
      const now = Date.now();
      let evictedAny = false;

      // Проход по всем записям: удаляем просроченные
      for (const [key, createdAt] of timestamps) {
        if (now - createdAt >= ttlMs) {
          cache.delete(key);
          timestamps.delete(key);
          console.log(
            `[evict TTL] removed key=${key} (expired after ${ttlMs}ms)`,
          );
          evictedAny = true;
        }
      }

      if (!evictedAny && cache.size > 0) {
        const oldestKey = timestamps.keys().next().value;
        cache.delete(oldestKey);
        timestamps.delete(oldestKey);
        console.log(
          `[evict TTL] no expired entries, removed oldest key=${oldestKey}`,
        );
      }
    },
  };
}

function createStrategy(name, options = {}) {
  switch (name) {
    case "LRU":
      return createLRU();
    case "LFU":
      return createLFU();
    case "TTL":
      return createTTL(options.ttl ?? 5000);
    default:
      return null;
  }
}

module.exports = { createStrategy };