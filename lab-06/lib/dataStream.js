async function* createDataStream(totalRecords) {
  const CATEGORIES = ["alpha", "beta", "gamma", "delta"];

  for (let i = 0; i < totalRecords; i++) {
    await new Promise((resolve) => setImmediate(resolve));

    yield {
      id: i + 1,
      timestamp: new Date(Date.now() - Math.random() * 1e10).toISOString(),
      category: CATEGORIES[i % CATEGORIES.length],
      value: Math.round((Math.random() * 1000 - 500) * 100) / 100,
      raw: `raw_payload_${i}`,
    };
  }
}

async function* processStream(stream, filterFn, mapFn) {
  for await (const record of stream) {
    if (!filterFn(record)) continue;

    const transformed = await mapFn(record);

    yield transformed;
  }
}

async function consumeStream(stream, batchSize, onBatch) {
  let batch = [];

  let totalProcessed = 0;
  let totalBatches = 0;

  for await (const record of stream) {
    batch.push(record);
    totalProcessed++;

    if (batch.length >= batchSize) {
      await onBatch(batch, totalBatches);
      totalBatches++;
      batch = [];
    }
  }

  if (batch.length > 0) {
    await onBatch(batch, totalBatches);
    totalBatches++;
  }

  return { totalProcessed, totalBatches };
}

module.exports = { createDataStream, processStream, consumeStream };
