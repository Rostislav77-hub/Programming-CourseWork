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
