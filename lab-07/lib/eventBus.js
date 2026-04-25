'use strict';

class EventBus {
  constructor() {
    this._events = {};
    this._subscriptions = new Map();
    this._nextId = 1;
  }

  subscribe(event, listener) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(listener);
    const id = this._nextId++;
    this._subscriptions.set(id, { event, listener });
    return id;
  }

  subscribeOnce(event, listener) {
    const id = this._nextId++;

    const wrapper = (payload) => {
      listener(payload);
      this.unsubscribe(id); 
    };

    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(wrapper);
    this._subscriptions.set(id, { event, listener: wrapper });

    return id;
  }

  unsubscribe(subscriptionId) {
    const sub = this._subscriptions.get(subscriptionId);
    if (!sub) return false;

    const { event, listener } = sub;
    
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(l => l !== listener);
      
      if (this._events[event].length === 0) {
        delete this._events[event];
      }
    }
    
    this._subscriptions.delete(subscriptionId);
    return true;
  }

 publish(event, payload) {
    if (!this._events[event] || this._events[event].length === 0) {
      if (event === 'error') {
        const errToThrow = payload instanceof Error ? payload : new Error(payload || 'Unhandled error');
        throw errToThrow; 
      }
      return false; 
    }

    const listeners = [...this._events[event]];
    
    listeners.forEach(listener => {
      try {
        listener(payload);
      } catch (error) {
        if (event !== 'error') {
          const errObj = new Error(`Помилка в обробнику події '${event}': ${error.message}`);
          errObj.originalError = error;
          this.publish('error', errObj); 
        } else {
          console.error('Критичний збій у самому каналі error:', error);
        }
      }
    });

    return true;
  }

  listenerCount(event) {
    return this._events[event] ? this._events[event].length : 0;
  }

  clear(event) {
    if (event) {
      delete this._events[event];
      for (const [id, sub] of this._subscriptions) {
        if (sub.event === event) this._subscriptions.delete(id);
      }
    } else {
      this._events = {};
      this._subscriptions.clear();
    }
  }
}

module.exports = EventBus;