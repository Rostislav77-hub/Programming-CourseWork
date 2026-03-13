function generateKey(args) {
  return JSON.stringify(args);
}

function memoize(fn) {
  const cache = new Map();

  function memoized(...args) {
    const key = generateKey(args);

    if (cache.has(key)) {
      console.log(`[cache HIT]  key=${key}`);
      return cache.get(key);
    }

    console.log(`[cache MISS] key=${key}`);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }

  memoized.cache = cache;

  return memoized;
}

module.exports = { memoize, generateKey };
