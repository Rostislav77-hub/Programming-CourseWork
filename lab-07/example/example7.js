const EventBus = require('../lib/eventBus');

const bus = new EventBus();

const Warehouse = {
  init() {
    this._id = bus.subscribe('order:new', ({ orderId, item, qty }) => {
      console.log(`  [Склад]     Резервую ${qty} шт. "${item}" для замовлення #${orderId}`);
    });
  },
  shutdown() {
    bus.unsubscribe(this._id);
    console.log('  [Склад]     Відмовився від order:new');
  },
};

const Logistics = {
  init() {
    this._id = bus.subscribe('order:new', ({ orderId, item }) => {
      console.log(`  [Логістика] Створюю маршрут доставки для замовлення #${orderId} (${item})`);
    });
  },
};

const Stats = {
  count: 0,
  init() {
    this._id = bus.subscribe('order:new', () => {
      this.count++;
      console.log(`  [Аналітика] Усього замовлень прийнято: ${this.count}`);
    });
  },
};

const Manager = {
  init() {
    this._id = bus.subscribe('stock:low', ({ item, remaining }) => {
      console.log(`  [Менеджер]  Запускаю закупівлю "${item}" (залишок: ${remaining} шт.)`);
    });
  },
};

const Audit = {
  init() {
    this._id = bus.subscribeOnce('order:new', ({ orderId }) => {
      console.log(`  [Аудит]    Перше замовлення зміни зафіксовано: #${orderId}`);
    });
  },
};

Warehouse.init();
Logistics.init();
Stats.init();
Manager.init();
Audit.init();


console.log('━━━ Замовлення #1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
bus.publish('order:new', { orderId: 1, item: 'Ноутбук', qty: 2 });

console.log('\n━━━ Замовлення #2 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
bus.publish('order:new', { orderId: 2, item: 'Миша', qty: 5 });

console.log('\n━━━ Сигнал низького залишку ━━━━━━━━━━━━━━━━━━━━');
bus.publish('stock:low', { item: 'Ноутбук', remaining: 3 });

console.log('\n━━━ Склад йде на техобслуговування ━━━━━━━━━━━');
Warehouse.shutdown();

console.log('\n━━━ Замовлення #3 (склад вже відписаний) ━━━━━━━━━━━━━━');
bus.publish('order:new', { orderId: 3, item: 'Клавіатура', qty: 1 });

console.log('\n━━━ Фінальна статистика ━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Замовлень оброблено: ${Stats.count}`);
console.log(`  Слухачів 'order:new' зараз: ${bus.listenerCount('order:new')}`);