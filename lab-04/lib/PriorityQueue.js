class PriorityQueue {
  constructor() {
    this._data = [];
    this._counter = 0;
  }
  get size() {
    return this._data.length;
  }
  get isEmpty() {
    return this._data.length === 0;
  }
  enqueue(item, priority) {
    if (typeof priority !== "number" || isNaN(priority)) {
      throw new TypeError(
        `priority повинно бути числом, отримано: ${priority}`,
      );
    }

    this._data.push({
      item,
      priority,
      insertOrder: this._counter++,
    });
  }
  _findIndex({ highest, lowest, oldest, newest } = {}) {
    if (this._data.length === 0) return -1;
    let bestIdx = 0;

    for (let i = 1; i < this._data.length; i++) {
      const current = this._data[i];
      const best = this._data[bestIdx];

      if (highest) {
        if (
          current.priority < best.priority ||
          (current.priority === best.priority &&
            current.insertOrder < best.insertOrder)
        ) {
          bestIdx = i;
        }
      } else if (lowest) {
        if (
          current.priority > best.priority ||
          (current.priority === best.priority &&
            current.insertOrder < best.insertOrder)
        ) {
          bestIdx = i;
        }
      } else if (newest) {
        if (current.insertOrder > best.insertOrder) {
          bestIdx = i;
        }
      } else {
        if (current.insertOrder < best.insertOrder) {
          bestIdx = i;
        }
      }
    }

    return bestIdx;
  }
  peek(flags = {}) {
    const idx = this._findIndex(flags);
    if (idx === -1) return undefined;
    return this._data[idx].item;
  }
  dequeue(flags = {}) {
    const idx = this._findIndex(flags);
    if (idx === -1) return undefined;
    const [removed] = this._data.splice(idx, 1);
    return removed.item;
  }
  toSortedArray() {
    return [...this._data].sort((a, b) =>
      a.priority !== b.priority
        ? a.priority - b.priority
        : a.insertOrder - b.insertOrder,
    );
  }
}

module.exports = PriorityQueue;
