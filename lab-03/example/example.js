const { memoize } = require("../lib/memoize");

function add(a, b) {
  return a + b;
}

const memoizedAdd = memoize(add, { maxSize: 2 });

console.log("=== Тестування ліміту кешу (maxSize: 2) ===");

console.log("1. Виклик (1, 1):", memoizedAdd(1, 1));
console.log("2. Виклик (2, 2):", memoizedAdd(2, 2));
console.log("3. Виклик (1, 1):", memoizedAdd(1, 1));

console.log("4. Виклик (3, 3):", memoizedAdd(3, 3));

console.log("5. Виклик (1, 1):", memoizedAdd(1, 1));
