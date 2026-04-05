const { asyncMapCallback, asyncMapPromise } = require("../lib/asyncMap");

const numbers = [1, 2, 3, 4, 5];
console.log("--- Тест 1: Callback Version ---");

function multiplyByTwoCallback(num, index, cb) {
  setTimeout(() => {
    cb(null, num * 2);
  }, 500);
}

asyncMapCallback(numbers, multiplyByTwoCallback, (err, results) => {
  if (err) {
    console.error("Помилка (Callback):", err);
  } else {
    console.log("Результат (Callback):", results); // Має бути [2, 4, 6, 8, 10]

    runPromiseTests();
  }
});

async function runPromiseTests() {
  console.log("\n--- Тест 2: Promise Version (async/await) ---");

  // Итератор на промисах
  const multiplyByTenPromise = async (num, index) => {
    return new Promise((resolve) => setTimeout(() => resolve(num * 10), 500));
  };

  try {
    const resultsPromise = await asyncMapPromise(numbers, multiplyByTenPromise);
    console.log("Результат (Promise):", resultsPromise); // Має бути [10, 20, 30, 40, 50]
  } catch (err) {
    console.error("Помилка (Promise):", err);
  }

  console.log("\n--- Тест 3: Abortable Process (Скасування) ---");

  const controller = new AbortController();

  const slowIterator = async (num) => {
    return new Promise((resolve) => setTimeout(() => resolve(num * 100), 1500));
  };

  try {
    setTimeout(() => {
      console.log(" Скасовуємо операцію...");
      controller.abort();
    }, 500);

    await asyncMapPromise(numbers, slowIterator, { signal: controller.signal });
    console.log("Цей текст не повинен вивестись, бо ми відмінили процес.");
  } catch (err) {
    console.error(`Помилка (Abort): ${err.name} - ${err.message}`);
  }
}
