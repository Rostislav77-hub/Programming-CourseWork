function asyncMapCallback(array, iteratee, finalCallback) {
  if (array.length === 0) {
    return finalCallback(null, []);
  }

  const results = new Array(array.length).fill(undefined);

  let completed = 0;

  let hasError = false;

  array.forEach((item, index) => {
    iteratee(item, index, (err, result) => {
      if (hasError) return;

      if (err) {
        hasError = true;
        return finalCallback(err, null);
      }

      results[index] = result;
      completed++;

      if (completed === array.length) {
        finalCallback(null, results);
      }
    });
  });
}
function asyncMapPromise(array, iteratee, options = {}) {
  const { signal } = options;
  if (signal?.aborted) {
    return Promise.reject(createAbortError());
  }
  if (array.length === 0) {
    return Promise.resolve([]);
  }
  const promises = array.map((item, index) => {
    return Promise.race([iteratee(item, index), abortPromise(signal)]);
  });

  return Promise.all(promises);
}
function abortPromise(signal) {
  if (!signal) {
    return new Promise(() => {});
  }

  return new Promise((_, reject) => {
    if (signal.aborted) {
      return reject(createAbortError());
    }
    signal.addEventListener(
      "abort",
      () => {
        reject(createAbortError());
      },
      { once: true },
    );
  });
}
function createAbortError() {
  return new DOMException(
    "Операция была отменена через AbortSignal",
    "AbortError",
  );
}
module.exports = { asyncMapCallback, asyncMapPromise };
