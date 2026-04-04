const PriorityQueue = require("../lib/PriorityQueue");

const queue = new PriorityQueue();

console.log("=== Додаємо елементи в чергу ===");
// Формат: enqueue(дані, пріоритет)
// (1 - найвищий пріоритет, 10 - найнижчий)
queue.enqueue("Завдання A (Звичайне)", 5);
queue.enqueue("Завдання B (ТЕРМІНОВО!)", 1);
queue.enqueue("Завдання C (Фонове)", 10);
queue.enqueue("Завдання D (ТЕРМІНОВО-2!)", 1); // Такий самий пріоритет як у B, але додано пізніше

console.log("Кількість елементів:", queue.size);

console.log("\n=== Тестуємо вилучення (dequeue) ===");

// 1. Highest: має вийти "Завдання B" (пріоритет 1, додано раніше ніж D)
console.log("Highest (найвищий пріоритет):", queue.dequeue({ highest: true }));

// 2. Lowest: має вийти "Завдання C" (пріоритет 10)
console.log("Lowest (найнижчий пріоритет):", queue.dequeue({ lowest: true }));

// В черзі залишилися A (старе) та D (нове).
// 3. Newest: має вийти "Завдання D", бо воно було додано останнім з тих, що залишились
console.log("Newest (останнє додане):", queue.dequeue({ newest: true }));

// 4. Oldest: має вийти "Завдання A", бо воно чекає найдовше
console.log("Oldest (найперше додане):", queue.dequeue({ oldest: true }));

console.log("\nЧерга порожня?", queue.isEmpty);
