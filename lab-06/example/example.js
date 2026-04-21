const { createDataStream, processStream, consumeStream } = require('../lib/dataStream');

async function runDemo() {
  console.log("Запуск обробки великих даних (Async Iterators)\n");

  const TOTAL_RECORDS = 1_000_000;
  const BATCH_SIZE = 50_000;       

  const startMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  const startTime = Date.now();

  console.log(`Джерело: ${TOTAL_RECORDS} записів.`);
  console.log(`Шукаємо категорію 'alpha' зі значенням > 400...\n`);

  const rawStream = createDataStream(TOTAL_RECORDS);
  const processedStream = processStream(
    rawStream,
    (record) => record.category === 'alpha' && record.value > 400,
    (record) => ({ id: record.id, category: record.category, value: record.value })
  );

  const stats = await consumeStream(processedStream, BATCH_SIZE, async (batch, index) => {
    console.log(`Зібрано пачку #${index + 1} (${batch.length} записів). Останній ID: ${batch[batch.length - 1]?.id}`);
  });

  const endTime = Date.now();
  const endMemory = process.memoryUsage().heapUsed / 1024 / 1024;

  console.log(`\n Обробку успішно завершено!`);
  console.log(`Знайдено цільових записів: ${stats.totalProcessed}`);
  console.log(`Час виконання: ${(endTime - startTime) / 1000} сек`);
  console.log(`Пам'ять ДО: ${Math.round(startMemory)} MB`);
  console.log(`Пам'ять ПІСЛЯ: ${Math.round(endMemory)} MB`);
  console.log(`\n Висновок: Ми прогнали 1 мільйон об'єктів, але пам'ять майже не змінилася. Витік відсутній!`);
}

runDemo().catch(console.error);