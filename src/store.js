import applyDelta from './apply-delta';
import Batcher from './batcher';
import get from './get';
import getRaw from './get-raw';
import queryToPaths from './query-to-paths';
import resolvePath from './resolve-path';
import Router from './router';
import triggerWatchers from './trigger-watchers';

export default class Store {
  constructor({batchDelay: delay = 0, cache = {}, router = new Router()} = {}) {
    this.batcher = new Batcher({delay, router, store: this});
    this.cache = cache;
    this.router = router;
    this.watchers = {};
    this.watcherIndex = 0;
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

  run(options) {
    return this.batcher.run(options);
  }

  destroy() {
    return this.batcher.destroy();
  }

  update(delta) {
    const {cache: prev} = this;
    const next = this.cache = applyDelta(prev, delta);
    if (next !== prev) triggerWatchers(this.watchers, prev, next, delta);
    return this;
  }

  watch(query, cb) {
    this.unwatch(cb);
    this.watchers[++this.watcherIndex] = {paths: queryToPaths(query), cb};
    return this;
  }

  unwatch(cb) {
    const {watchers} = this;

    for (let i in watchers) {
      if (!cb || watchers[i].cb === cb) delete watchers[i];
    }

    return this;
  }
}
