import applyDelta from './apply-delta';
import get from './get';
import getRaw from './get-raw';
import queryToPaths from './query-to-paths';
import resolvePath from './resolve-path';
import Router from './router';
import triggerWatchers from './trigger-watchers';

export default class Store {
  constructor({cache = {}, router = new Router()} = {}) {
    this.cache = cache;
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

  run(options) {
    return this.router.run({...options, store: this});
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
