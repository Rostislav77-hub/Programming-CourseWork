function generateKey(args) {
  return JSON.stringify(args);
}

function memoize(fn, options = {}) {
  const maxSize = options.maxSize ?? Infinity;

  const cache = new Map();

  function memoized(...args) {
    const key = generateKey(args);

    if (cache.has(key)) {
      console.log(`[cache HIT]  key=${key}`);
      return cache.get(key);
    }

    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
      console.log(`[evict FIFO] removed key=${oldestKey}`);
    }

    console.log(`[cache MISS] key=${key}`);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }

  memoized.cache = cache;
  memoized.options = { maxSize };

  return memoized;
}

module.exports = { memoize, generateKey };
