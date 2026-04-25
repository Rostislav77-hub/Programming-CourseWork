'use strict';

async function* createDataStream(totalRecords) {
  if (typeof totalRecords !== 'number' || totalRecords < 0) {
    throw new TypeError(`totalRecords має бути невід'ємним числом, отримано: ${totalRecords}`);
  }

  const CATEGORIES = ['alpha', 'beta', 'gamma', 'delta'];

  try {
    for (let i = 0; i < totalRecords; i++) {
      
      if (i === 500 && Math.random() > 0.9) { 
        throw new Error("З'єднання з БД втрачено (імітація аварії)!");
      }

      await new Promise(resolve => setImmediate(resolve));

      yield {
        id:        i + 1,
        timestamp: new Date(Date.now() - Math.random() * 1e10).toISOString(),
        category:  CATEGORIES[i % CATEGORIES.length],
        value:     Math.round((Math.random() * 1000 - 500) * 100) / 100,
        raw:       `raw_payload_${i}`,
      };
    }
  } finally {
  }
}

async function* processStream(stream, filterFn, mapFn) {
  try {
    for await (const record of stream) {

      let passes;
      try {
        passes = filterFn(record);
      } catch (err) {
        throw new Error(`processStream: filterFn кинула помилку на записі id=${record?.id}: ${err.message}`);
      }

      if (!passes) continue;

      let transformed;
      try {
        transformed = await mapFn(record);
      } catch (err) {
        throw new Error(`processStream: mapFn кинула помилку на записі id=${record?.id}: ${err.message}`);
      }

      yield transformed;
    }
  } catch (err) {
    throw err;
  }
}

async function consumeStream(stream, batchSize, onBatch) {
  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new TypeError(`batchSize має бути цілим числом > 0, отримано: ${batchSize}`);
  }

  let batch          = [];
  let totalProcessed = 0;
  let totalBatches   = 0;

  try {
    for await (const record of stream) {
      batch.push(record);
      totalProcessed++;

      if (batch.length >= batchSize) {
        try {
          await onBatch(batch, totalBatches);
        } catch (err) {
          err.partialStats = { totalProcessed, totalBatches };
          throw err;
        }
        totalBatches++;
        batch = [];
      }
    }

    if (batch.length > 0) {
      try {
        await onBatch(batch, totalBatches);
      } catch (err) {
        err.partialStats = { totalProcessed, totalBatches };
        throw err;
      }
      totalBatches++;
    }

  } catch (err) {
    if (!err.partialStats) {
      err.partialStats = { totalProcessed, totalBatches };
    }
    throw err;
  }

  return { totalProcessed, totalBatches };
}

module.exports = { createDataStream, processStream, consumeStream };