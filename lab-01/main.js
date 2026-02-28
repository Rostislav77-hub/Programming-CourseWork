// --- 1. Generator Functions ---

function* fibonacciGenerator() {
  let current = 0;
  let next = 1;

  while (true) {
    yield current;
    const temp = current + next;
    current = next;
    next = temp;
  }
}

function* colorCycleGenerator() {
  const colors = [
    { name: "RED", code: "\x1b[31m" },
    { name: "GREEN", code: "\x1b[32m" },
    { name: "BLUE", code: "\x1b[34m" },
  ];
  let index = 0;

  while (true) {
    yield colors[index];
    index = (index + 1) % colors.length;
  }
}
// --- 2. Timeout Iterator Function ---

function consumeIterator(iterator, timeoutSeconds, processingCallback) {
  if (!iterator || typeof iterator.next !== "function") {
    throw new Error("Invalid iterator.");
  }
  if (typeof timeoutSeconds !== "number" || timeoutSeconds <= 0) {
    throw new Error("Timeout must be a positive number.");
  }

  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;
  let iterationCount = 0;
  const state = { total: 0 };

  while (Date.now() - startTime < timeoutMs) {
    const result = iterator.next();
    if (result.done) break;

    processingCallback(result.value, iterationCount, state);
    iterationCount++;
  }

  console.log(`\nTotal iterations: ${iterationCount}\n`);
}

// --- 3. Processing Tasks ---
function processNumbers(value, iteration, state) {
  state.total += value;
  const avg = iteration === 0 ? value : state.total / (iteration + 1);

  console.log(
    `[Iter: ${iteration}] Fibonacci: ${value} | Total: ${state.total} | Avg: ${avg.toFixed(2)}`,
  );
}

function processColors(colorObj, iteration) {
  const currentDate = new Date().toISOString();
  const resetCode = "\x1b[0m";

  console.log(
    `${colorObj.code}[${currentDate}] Iteration: ${iteration} — Color: ${colorObj.name}${resetCode}`,
  );
}

// --- 4. Execution ---

try {
  const fibGen = fibonacciGenerator();
  consumeIterator(fibGen, 0.01, processNumbers);

  const colorGen = colorCycleGenerator();
  consumeIterator(colorGen, 0.01, processColors);
} catch (error) {
  console.error(error.message);
}
