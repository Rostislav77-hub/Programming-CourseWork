const { createStrategy } = require("./strategies");

function generateKey(args) {
  return JSON.stringify(args);
}
function evictFIFO(cache) {
  const oldestKey = cache.keys().next().value;
  cache.delete(oldestKey);
  console.log(`[evict FIFO] removed key=${oldestKey}`);
}

function memoize(fn, options = {}) {
  const maxSize = options.maxSize ?? Infinity;

  const strategy = createStrategy(options.strategy, options);

  const cache = new Map();

  function memoized(...args) {
    const key = generateKey(args);

    if (cache.has(key)) {
      console.log(`[cache HIT]  key=${key}`);
      if (strategy) strategy.onGet(key, cache);
      return cache.get(key);
    }
    if (cache.size >= maxSize) {
      if (strategy) {
        strategy.evict(cache);
      } else {
        evictFIFO(cache);
      }
    }

    console.log(`[cache MISS] key=${key}`);
    const result = fn(...args);
    cache.set(key, result);

    if (strategy) strategy.onSet(key, cache);

    return result;
  }

  memoized.cache = cache;
  memoized.options = { maxSize, strategy: options.strategy ?? "FIFO" };

  return memoized;
}
module.exports = { memoize, generateKey };
