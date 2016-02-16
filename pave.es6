const isObject = obj => typeof obj === 'object' && obj !== null;

const isArray = Array.isArray;

export const queryToPaths = (query, path = []) => {
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

export const getQueryCost = (query, limit = Infinity, cost = 0, total = 0) => {
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

const routeToQuery = route => {
  const path = route.split('.');
  for (let i = 0, l = path.length; i < l; ++i) path[i] = path[i].split('|');
  return path;
};

const pathToRoute = path => path.join('.');

const pathSegmentToRouteQuerySegment = segment =>
  isObject(segment) ? '$params' : [segment, '$key'];

const flattenRoutes = routes => {
  const flattened = {};
  for (let route in routes) {
    const fn = routes[route];
    const paths = queryToPaths(routeToQuery(route));
    for (let i = 0, l = paths.length; i < l; ++i) {
      const path = paths[i];
      const route = pathToRoute(path);
      flattened[route] = {fn, arity: route === '*' ? 0 : path.length};
    }
  }
  return flattened;
};

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

let nextFnid = 1;
const getFnid = fn => fn.__FNID__ || (fn.__FNID__ = nextFnid++);

const ROUTE_NOT_FOUND_ERROR = new Error('Route not found');
const EXPENSIVE_QUERY_ERROR = new Error('Query is too expensive');
const DEFAULT_ROUTES = {'*': () => { throw ROUTE_NOT_FOUND_ERROR; }};

export class Router {
  constructor({maxQueryCost, routes = DEFAULT_ROUTES} = {}) {
    this.routes = flattenRoutes(routes);
    if (maxQueryCost) this.maxQueryCost = maxQueryCost;
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
        const route = routes[pathToRoute(paths[j])];
        if (route) return route;
      }
    }

    return routes['*'];
  }

  run({
    query = [],
    context = {},
    force = false,
    change = [],
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

      if (!paths.length) return change;

      const jobs = {};
      const unresolvedPaths = [];
      for (let i = 0, l = paths.length; i < l; ++i) {
        const path = paths[i];
        let route = this.getRouteForPath(path);
        if (!route) continue;
        const {fn, arity} = route;

        if (path.length > arity && arity > 0) unresolvedPaths.push(path);

        const fnid = getFnid(fn);
        let job = jobs[fnid];
        if (!job) {
          job = jobs[fnid] = {
            fn,
            options: {context, store, paths: []},
            keys: []
          };
        }

        const {keys, options} = job;
        options.paths.push(path);

        for (let i = 0; i < arity; ++i) {
          if (!options[i]) {
            options[i] = [];
            keys[i] = {};
          }
          const segment = path[i];
          const key = toKey(segment);
          if (keys[i][key]) continue;
          options[i].push(segment);
          keys[i][key] = true;
        }
      }

      const work = [];
      for (let fnid in jobs) {
        const {fn, options} = jobs[fnid];
        work.push(SyncPromise.resolve(options).then(fn).then(newChange => {
          store.applyChange(newChange);
          change.push(newChange);
        }));
      }

      const recurse = () =>
        this.run({
          query: [unresolvedPaths],
          context,
          change,
          store,
          onlyUnresolved: true
        });

      return SyncPromise.all(work).then(recurse);
    });
  }
}

const DEFAULT_ROUTER = new Router();

export class Store {
  constructor({cache = {}, router = DEFAULT_ROUTER, maxRefDepth = 3} = {}) {
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

  applyChange(change) {
    if (!change) return;
    if (!isArray(change)) return this.set(change.path, change.value);
    for (let i = 0, l = change.length; i < l; ++i) this.applyChange(change[i]);
    return this;
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
