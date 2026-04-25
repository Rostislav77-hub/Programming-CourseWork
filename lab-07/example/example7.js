const EventBus = require('../lib/eventBus');

const bus = new EventBus();

const Warehouse = {
  init() {
    this._id = bus.subscribe('order:new', ({ orderId, item, qty }) => {
      console.log(`  [Склад]     Резервирую ${qty} шт. "${item}" для заказа #${orderId}`);
    });
  },
  shutdown() {
    bus.unsubscribe(this._id);
    console.log('  [Склад]     Отписался от order:new');
  },
};

const Logistics = {
  init() {
    this._id = bus.subscribe('order:new', ({ orderId, item }) => {
      console.log(`  [Логистика] Создаю маршрут доставки для заказа #${orderId} (${item})`);
    });
  },
};

const Stats = {
  count: 0,
  init() {
    this._id = bus.subscribe('order:new', () => {
      this.count++;
      console.log(`  [Аналитика] Всего заказов принято: ${this.count}`);
    });
  },
};

const Manager = {
  init() {
    this._id = bus.subscribe('stock:low', ({ item, remaining }) => {
      console.log(`  [Менеджер]  Запускаю закупку "${item}" (остаток: ${remaining} шт.)`);
    });
  },
};

const Audit = {
  init() {
    this._id = bus.subscribeOnce('order:new', ({ orderId }) => {
      console.log(`  [Аудит]     Первый заказ смены зафиксирован: #${orderId}`);
    });
  },
};

Warehouse.init();
Logistics.init();
Stats.init();
Manager.init();
Audit.init();


console.log('━━━ Заказ #1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
bus.publish('order:new', { orderId: 1, item: 'Ноутбук', qty: 2 });

console.log('\n━━━ Заказ #2 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
bus.publish('order:new', { orderId: 2, item: 'Мышь', qty: 5 });

console.log('\n━━━ Сигнал низкого остатка ━━━━━━━━━━━━━━━━━━━━');
bus.publish('stock:low', { item: 'Ноутбук', remaining: 3 });

console.log('\n━━━ Склад уходит на техобслуживание ━━━━━━━━━━━');
Warehouse.shutdown();

console.log('\n━━━ Заказ #3 (склад уже отписан) ━━━━━━━━━━━━━━');
bus.publish('order:new', { orderId: 3, item: 'Клавиатура', qty: 1 });

console.log('\n━━━ Финальная статистика ━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Заказов обработано: ${Stats.count}`);
console.log(`  Слушателей 'order:new' сейчас: ${bus.listenerCount('order:new')}`);