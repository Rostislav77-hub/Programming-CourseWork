const { memoize } = require('../lib/memoize');

function add(a, b) {
  return a + b;
}
console.log("=== 1. Перевірка стратегії LRU (Least Recently Used) ===");
const lruAdd = memoize(add, { maxSize: 2, strategy: 'LRU' });

lruAdd(1, 1); 
lruAdd(2, 2); 
lruAdd(1, 1);
lruAdd(3, 3); 
lruAdd(2, 2); 
lruAdd(1, 1);

console.log("\n=== 2. Перевірка стратегії LFU (Least Frequently Used) ===");
const lfuAdd = memoize(add, { maxSize: 2, strategy: 'LFU' });

lfuAdd(1, 1);
lfuAdd(2, 2); 
lfuAdd(1, 1); 
lfuAdd(3, 3); 
lfuAdd(2, 2); 
lfuAdd(1, 1); 
