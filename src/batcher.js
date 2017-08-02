import Router from './router';
import Store from './store';

const createDeferred = () => {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

export default class Batcher {
  constructor({delay = 0, router = new Router(), store = new Store()} = {}) {
    this.delay = delay;
    this.router = router;
    this.store = store;
  }

  run({force, query}) {
    if (!this.delay) return this.router.run({force, query, store: this.store});

    if (!this.batch) {
      this.batch = {
        deferred: createDeferred(),
        force: [[]],
        query: [[]],
        timeoutId: setTimeout(::this.flush, this.delay)
      };
    }

    this.batch.query[0].push(query);
    if (force) this.batch.force[0].push(force === true ? query : force);
    return this.batch.deferred.promise;
  }

  flush() {
    const {batch: {deferred: {resolve, reject}, force, query}, store} = this;
    delete this.batch;
    this.router.run({force, query, store}).then(resolve, reject);
  }

  destroy() {
    if (this.batch) clearTimeout(this.batch.timeoutId);
  }
}
