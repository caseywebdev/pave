import applyDelta from './apply-delta';
import Deferred from './deferred';
import get from './get';
import getRaw from './get-raw';
import queryToPaths from './query-to-paths';
import resolvePath from './resolve-path';
import Router from './router';
import triggerWatchers from './trigger-watchers';

const runBatch = store => {
  const {deferred: {resolve, reject}, force, query} = this.batch;
  delete this.batch;
  store.router.run({query, force, store}).then(resolve, reject);
};

export default class Store {
  constructor({
    batchDelay = 0,
    cache = {},
    context = {},
    router = new Router()
  } = {}) {
    this.batchDelay = batchDelay;
    this.cache = cache;
    this.context = context;
    this.router = router;
    this.watchers = [];
  }

  get(path) {
    return get(this.cache, path);
  }

  getRaw(path) {
    return getRaw(this.cache, path);
  }

  resolve(path) {
    return resolvePath(this.cache, path);
  }

  update(delta) {
    const next = applyDelta(this.cache, delta);
    const {cache: prev} = this;
    if (next === prev) return this;

    this.cache = next;
    triggerWatchers(this.watchers, prev, next);
    return this;
  }

  run({query, force}) {
    const {batchDelay} = this;
    if (!batchDelay) return this.router.run({query, force, store: this});

    if (!this.batch) {
      this.batch = {
        deferred: new Deferred(),
        force: [[]],
        query: [[]],
        timeoutId: setTimeout(runBatch, batchDelay, this)
      };
    }

    this.batch.query[0].push(query);
    if (force) this.batch.force[0].push(force === true ? query : force);
    return this.batch.deferred.promise;
  }

  destroy() {
    const {batch: {timeoutId} = {}} = this;
    if (timeoutId) clearTimeout(timeoutId);
  }

  watch(query, cb) {
    this.unwatch(cb).watchers.push({paths: queryToPaths(query), cb});
    return this;
  }

  unwatch(cb) {
    const {watchers} = this;

    if (!cb) watchers.length = 0;

    for (let i = watchers.length - 1; i >= 0; --i) {
      if (watchers[i].cb === cb) watchers.splice(i, 1);
    }

    return this;
  }
}
