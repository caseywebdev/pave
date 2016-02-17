const isObject = obj => typeof obj === 'object' && obj !== null;

const isArray = Array.isArray;

const flatten = (obj, flattened = []) => {
  if (isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; ++i) flatten(obj[i], flattened);
  } else {
    flattened.push(obj);
  }
  return flattened;
};

const queryToPaths = (query, path = []) => {
  let i = 0;
  const l = query.length;
  while (i < l && !isArray(query[i])) ++i;

  if (i === l) return [path.concat(query)];

  const paths = [];
  path = path.concat(query.slice(0, i));
  const pivot = query[i];
  const rest = query.slice(i + 1);
  for (let i = 0, l = pivot.length; i < l; ++i) {
    paths.push.apply(paths, queryToPaths([].concat(pivot[i], rest), path));
  }

  return paths;
};

const getQueryCost = (query, limit = Infinity, cost = 0, total = 0) => {
  let i = 0;
  const l = query.length;
  while (i < l && total + cost + i <= limit && !isArray(query[i])) ++i;

  if (total + (cost += i) > limit || i === l) return total + cost;

  const pivot = query[i];
  const rest = query.slice(i + 1);
  for (let i = 0, l = pivot.length; i < l; ++i) {
    total = getQueryCost([].concat(pivot[i], rest), limit, cost, total);
    if (total > limit) return total;
  }

  return total;
};

const routeToParams = route => route.split('.');

const pathToRoute = path => path.join('.');

const pathSegmentToRouteQuerySegment = segment =>
  isObject(segment) ? ['$obj', '$objs', '*'] : [segment, '$key', '$keys', '*'];

const orderObj = obj => {
  if (!isObject(obj)) return obj;

  if (isArray(obj)) {
    const val = [];
    for (let i = 0, l = obj.length; i < l; ++i) val.push(orderObj(obj[i]));
    return val;
  }

  const val = {};
  const keys = Object.keys(obj).sort();
  for (let i = 0, l = keys.length; i < l; ++i) {
    val[keys[i]] = orderObj(obj[keys[i]]);
  }
  return val;
};

const toKeys = arr => {
  const keys = [];
  for (let i = 0, l = arr.length; i < l; ++i) keys.push(toKey(arr[i]));
  return keys;
};

export const toKey = obj =>
  isArray(obj) ? JSON.stringify(toKeys(obj)) :
  isObject(obj) ? JSON.stringify(orderObj(obj)) :
  String(obj);

const isPluralParam = param =>
  param === '$objs' || param === '$keys' || param === '*';

const getJobKey = (params, path) => {
  let segments = [];
  for (let i = 0; i < params.length; ++i) {
    const param = params[i];
    segments.push(isPluralParam(param) ? param : path[i]);
  }
  return toKey(segments);
};

const EXPENSIVE_QUERY_ERROR = new Error('Query is too expensive');

const isPromise = obj => obj && typeof obj.then === 'function';

export class SyncPromise {
  static resolve = value => new SyncPromise(resolve => resolve(value));

  static reject = reason => new SyncPromise((_, reject) => reject(reason));

  static all = promises =>
    new SyncPromise((resolve, reject) => {
      let done = 0;
      const values = [];
      for (let i = 0, l = promises.length; i < l; ++i) {
        promises[i].then(value => {
          values[i] = value;
          if (++done === l) resolve(values);
        }).catch(reject);
      }
    });

  static race = promises =>
    new SyncPromise((resolve, reject) => {
      for (let i = 0, l = promises.length; i < l; ++i) {
        promises[i].then(resolve).catch(reject);
      }
    });

  constructor(callback) {
    let completed = false;

    const complete = (state, value) => {
      completed = true;
      this.state = state;
      this.value = value;
      const callbacks = this.callbacks[state];
      for (let i = 0, l = callbacks.length; i < l; ++i) callbacks[i](value);
    };

    const resolve = value => {
      if (completed) return;
      if (isPromise(value)) return value.then(resolve).catch(reject);
      complete('fulfilled', value);
    };

    const reject = reason => {
      if (completed) return;
      if (isPromise(reason)) return reason.then(reject).catch(reject);
      complete('rejected', reason);
    };

    this.state = 'pending';
    this.callbacks = {fulfilled: [], rejected: []};
    try { callback(resolve, reject); } catch (er) { reject(er); }
  }

  then(onFulfilled, onRejected) {
    return new SyncPromise((resolve, reject) => {
      const {callbacks: {fulfilled, rejected}, state, value} = this;

      const runFulfilled =
        onFulfilled ? value => resolve(onFulfilled(value)) : resolve;

      const runRejected =
        onRejected ? value => resolve(onRejected(value)) : reject;

      if (state === 'fulfilled') return runFulfilled(value);
      if (state === 'rejected') return runRejected(value);
      fulfilled.push(runFulfilled);
      rejected.push(runRejected);
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

export class Router {
  constructor({maxQueryCost, routes = {}} = {}) {
    this.maxQueryCost = maxQueryCost;
    this.routes = routes;
  }

  getRouteForPath(path) {
    const {routes} = this;
    const query = [];
    for (let i = 0, l = path.length; i < l; ++i) {
      query[i] = pathSegmentToRouteQuerySegment(path[i]);
    }

    for (let i = query.length; i > 0; --i) {
      const paths = queryToPaths(query.slice(0, i));
      for (let j = 0, l = paths.length; j < l; ++j) {
        const route = pathToRoute(paths[j]);
        const fn = routes[route];
        if (fn) return {route, fn};
      }
    }

    throw new Error(`No route matches ${JSON.stringify(path)}`);
  }

  run({
    query = [],
    context = {},
    force = false,
    changes = [],
    store = new Store(),
    onlyUnresolved = false
  }) {
    return SyncPromise.resolve().then(() => {
      const {maxQueryCost: limit} = this;
      if (limit && getQueryCost(query, limit) > limit) {
        throw EXPENSIVE_QUERY_ERROR;
      }

      let paths = queryToPaths(query);
      if (!force) {
        const undefPaths = [];
        for (let i = 0, l = paths.length; i < l; ++i) {
          const path = paths[i];
          const resolved = store.resolvePath(path);
          if (onlyUnresolved && path === resolved) continue;
          if (store.get(resolved) === undefined) undefPaths.push(resolved);
        }
        paths = undefPaths;
      }

      if (!paths.length) return changes;

      const jobs = {};
      const unresolvedPaths = [];
      for (let i = 0, l = paths.length; i < l; ++i) {
        const path = paths[i];
        const {route, fn} = this.getRouteForPath(path);
        const params = routeToParams(route);

        if (path.length > params.length && route !== '*') {
          unresolvedPaths.push(path);
        }

        const jobKey = getJobKey(params, path);

        let job = jobs[jobKey];
        if (!job) {
          job = jobs[jobKey] = {
            fn,
            args: {context, store, paths: []},
            keys: {}
          };
        }

        const {keys, args} = job;
        args.paths.push(path);

        for (let i = 0; i < params.length; ++i) {
          const param = params[i];
          const arg = path[i];
          if (isPluralParam(param)) {
            if (!args[i]) {
              args[i] = [];
              keys[i] = {};
            }
            const key = toKey(arg);
            if (keys[i][key]) continue;
            args[i].push(arg);
            keys[i][key] = true;
          } else args[i] = arg;
        }
      }

      const work = [];
      for (let key in jobs) {
        const {fn, args} = jobs[key];
        work.push(SyncPromise.resolve(args).then(fn).then(obj => {
          const flattened = flatten(obj);
          for (let i = 0, l = flattened.length; i < l; ++i) {
            const change = flattened[i];
            if (!change) continue;

            const {path, value} = change;
            if (!isArray(path) || !('value' in change)) continue;

            store.set(path, value);
            changes.push({path, value});
          }
        }));
      }

      const runUnresolved = () =>
        this.run({
          query: [unresolvedPaths],
          context,
          changes,
          store,
          onlyUnresolved: true
        });

      return SyncPromise.all(work).then(runUnresolved);
    });
  }
}

export class Store {
  constructor({cache = {}, router = new Router(), maxRefDepth = 3} = {}) {
    this.cache = cache;
    this.router = router;
    this.listeners = {};
    this.maxRefDepth = maxRefDepth;
  }

  resolveRefs(obj, depth = 0) {
    if (!isObject(obj)) return obj;

    if (isArray(obj)) {
      const val = [];
      for (let i = 0, l = obj.length; i < l; ++i) {
        val.push(this.resolveRefs(obj[i], depth));
      }
      return val;
    }

    const {$ref} = obj;
    if ($ref) return this.get($ref, depth + 1);

    const val = {};
    for (let key in obj) val[key] = this.resolveRefs(obj[key], depth);
    return val;
  }

  get(path, depth = 0) {
    if (depth > this.maxRefDepth) return {$ref: path};
    let cursor = this.cache;
    for (let i = 0, l = path.length; i < l && cursor != null; ++i) {
      if (cursor = cursor[toKey(path[i])]) {
        const {$ref} = cursor;
        if ($ref) cursor = this.get($ref, depth);
      }
    }
    return this.resolveRefs(cursor, depth);
  }

  set(path, value) {
    path = this.resolvePath(path.slice(0, -1)).concat(path[path.length - 1]);
    let cursor = this.cache;
    for (let i = 0, l = path.length; i < l; ++i) {
      const key = toKey(path[i]);
      if (i === l - 1) {
        if (cursor[key] === value) break;
        cursor[key] = value;
        this.triggerChange();
      } else {
        if (cursor[key] == null) cursor[key] = {};
        cursor = cursor[key];
      }
    }
    return this;
  }

  resolvePath(path) {
    let cursor = this.cache;
    for (let i = 0, l = path.length; i < l && cursor != null; ++i) {
      if (cursor = cursor[toKey(path[i])]) {
        const {$ref} = cursor;
        if ($ref) return this.resolvePath($ref.concat(path.slice(i + 1)));
      }
    }
    return path;
  }

  run(options) {
    return this.router.run({...options, store: this});
  }

  triggerChange() {
    if (!this.triggerChangeTimeoutId) {
      this.triggerChangeTimeoutId = setTimeout(::this._triggerChange);
    }
    return this;
  }

  _triggerChange() {
    delete this.triggerChangeTimeoutId;
    return this.trigger('change');
  }

  on(name, cb) {
    let listeners = this.listeners[name];
    if (!listeners) listeners = this.listeners[name] = [];
    listeners.push(cb);
    return this;
  }

  off(name, cb) {
    if (!name) this.listeners = {};
    if (!cb) delete this.listeners[name];
    let listeners = this.listeners[name];
    if (!listeners) return this;
    const newListeners = this.listeners[name] = [];
    for (let i = 0, l = listeners.length; i < l; ++i) {
      if (listeners[i] !== cb) newListeners.push(listeners[i]);
    }
    if (!newListeners.length) delete this.listeners[name];
    return this;
  }

  trigger(name, data, cb) {
    const listeners = this.listeners[name];
    if (!listeners) return this;
    for (let i = 0, l = listeners.length; i < l; ++i) listeners[i](data, cb);
    return this;
  }
}
