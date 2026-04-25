'use strict';

const { createDataStream, processStream, consumeStream } = require('../lib/dataStream');

async function runPipeline() {
  console.log('--- Запуск конвеєра обробки даних (Лаба 6) ---');

  const rawStream = createDataStream(1000);

  const myFilter = (record) => record.id % 2 === 0;
  const myMap = (record) => ({ ...record, value: record.value * 10, processed: true });


  const processedStream = processStream(rawStream, myFilter, myMap);

  const batchSize = 100;
  const saveBatch = async (batch, batchIndex) => {
    await new Promise(res => setTimeout(res, 50)); 
    console.log(`[Consumer] Збережено батч #${batchIndex} (${batch.length} записів). Останній ID: ${batch[batch.length - 1].id}`);
  };

  try {
    const stats = await consumeStream(processedStream, batchSize, saveBatch);
    console.log(`\n--- Успіх! Оброблено записів: ${stats.totalProcessed}, Батчів: ${stats.totalBatches} ---`);
  } catch (err) {
    console.error('\n[Consumer] 🚨 ЗБІЙ КОНВЕЄРА! Спіймано фатальну помилку:');
    console.error(`  -> ${err.message}`);
    
    if (err.partialStats) {
      console.log(`  -> Споживач встиг обробити: ${err.partialStats.totalProcessed} записів до збою.`);
    }
  }
}

runPipeline();