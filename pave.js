'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isObject = function isObject(obj) {
  return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null;
};

var isArray = Array.isArray;

var flatten = function flatten(obj) {
  var flattened = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  if (isArray(obj)) {
    for (var i = 0, l = obj.length; i < l; ++i) {
      flatten(obj[i], flattened);
    }
  } else {
    flattened.push(obj);
  }
  return flattened;
};

var queryToPaths = function queryToPaths(query) {
  var path = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  var i = 0;
  var l = query.length;
  while (i < l && !isArray(query[i])) {
    ++i;
  }if (i === l) return [path.concat(query)];

  var paths = [];
  path = path.concat(query.slice(0, i));
  var pivot = query[i];
  var rest = query.slice(i + 1);
  for (var _i = 0, _l = pivot.length; _i < _l; ++_i) {
    paths.push.apply(paths, queryToPaths([].concat(pivot[_i], rest), path));
  }

  return paths;
};

var getQueryCost = function getQueryCost(query) {
  var limit = arguments.length <= 1 || arguments[1] === undefined ? Infinity : arguments[1];
  var cost = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
  var total = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  var i = 0;
  var l = query.length;
  while (i < l && total + cost + i <= limit && !isArray(query[i])) {
    ++i;
  }if (total + (cost += i) > limit || i === l) return total + cost;

  var pivot = query[i];
  var rest = query.slice(i + 1);
  for (var _i2 = 0, _l2 = pivot.length; _i2 < _l2; ++_i2) {
    total = getQueryCost([].concat(pivot[_i2], rest), limit, cost, total);
    if (total > limit) return total;
  }

  return total;
};

var routeToParams = function routeToParams(route) {
  return route.split('.');
};

var pathToRoute = function pathToRoute(path) {
  return path.join('.');
};

var pathSegmentToRouteQuerySegment = function pathSegmentToRouteQuerySegment(segment) {
  return isObject(segment) ? ['$obj', '$objs', '*'] : [segment, '$key', '$keys', '*'];
};

var orderObj = function orderObj(obj) {
  if (!isObject(obj)) return obj;

  if (isArray(obj)) {
    var _val = [];
    for (var i = 0, l = obj.length; i < l; ++i) {
      _val.push(orderObj(obj[i]));
    }return _val;
  }

  var val = {};
  var keys = Object.keys(obj).sort();
  for (var i = 0, l = keys.length; i < l; ++i) {
    val[keys[i]] = orderObj(obj[keys[i]]);
  }
  return val;
};

var toKeys = function toKeys(arr) {
  var keys = [];
  for (var i = 0, l = arr.length; i < l; ++i) {
    keys.push(toKey(arr[i]));
  }return keys;
};

var toKey = exports.toKey = function toKey(obj) {
  return isArray(obj) ? JSON.stringify(toKeys(obj)) : isObject(obj) ? JSON.stringify(orderObj(obj)) : String(obj);
};

var isPluralParam = function isPluralParam(param) {
  return param === '$objs' || param === '$keys' || param === '*';
};

var getJobKey = function getJobKey(params, path) {
  var segments = [];
  for (var i = 0; i < params.length; ++i) {
    var param = params[i];
    segments.push(isPluralParam(param) ? param : path[i]);
  }
  return toKey(segments);
};

var EXPENSIVE_QUERY_ERROR = new Error('Query is too expensive');

var isPromise = function isPromise(obj) {
  return obj && typeof obj.then === 'function';
};

var SyncPromise = exports.SyncPromise = function () {
  function SyncPromise(callback) {
    var _this = this;

    _classCallCheck(this, SyncPromise);

    var completed = false;

    var complete = function complete(state, value) {
      completed = true;
      _this.state = state;
      _this.value = value;
      var callbacks = _this.callbacks[state];
      for (var i = 0, l = callbacks.length; i < l; ++i) {
        callbacks[i](value);
      }
    };

    var resolve = function resolve(value) {
      if (completed) return;
      if (isPromise(value)) return value.then(resolve).catch(reject);
      complete('fulfilled', value);
    };

    var reject = function reject(reason) {
      if (completed) return;
      if (isPromise(reason)) return reason.then(reject).catch(reject);
      complete('rejected', reason);
    };

    this.state = 'pending';
    this.callbacks = { fulfilled: [], rejected: [] };
    try {
      callback(resolve, reject);
    } catch (er) {
      reject(er);
    }
  }

  _createClass(SyncPromise, [{
    key: 'then',
    value: function then(onFulfilled, onRejected) {
      var _this2 = this;

      return new SyncPromise(function (resolve, reject) {
        var _callbacks = _this2.callbacks;
        var fulfilled = _callbacks.fulfilled;
        var rejected = _callbacks.rejected;
        var state = _this2.state;
        var value = _this2.value;


        var runFulfilled = onFulfilled ? function (value) {
          return resolve(onFulfilled(value));
        } : resolve;

        var runRejected = onRejected ? function (value) {
          return resolve(onRejected(value));
        } : reject;

        if (state === 'fulfilled') return runFulfilled(value);
        if (state === 'rejected') return runRejected(value);
        fulfilled.push(runFulfilled);
        rejected.push(runRejected);
      });
    }
  }, {
    key: 'catch',
    value: function _catch(onRejected) {
      return this.then(null, onRejected);
    }
  }]);

  return SyncPromise;
}();

SyncPromise.resolve = function (value) {
  return new SyncPromise(function (resolve) {
    return resolve(value);
  });
};

SyncPromise.reject = function (reason) {
  return new SyncPromise(function (_, reject) {
    return reject(reason);
  });
};

SyncPromise.all = function (promises) {
  return new SyncPromise(function (resolve, reject) {
    var done = 0;
    var values = [];

    var _loop = function _loop(i, l) {
      promises[i].then(function (value) {
        values[i] = value;
        if (++done === l) resolve(values);
      }).catch(reject);
    };

    for (var i = 0, l = promises.length; i < l; ++i) {
      _loop(i, l);
    }
  });
};

SyncPromise.race = function (promises) {
  return new SyncPromise(function (resolve, reject) {
    for (var i = 0, l = promises.length; i < l; ++i) {
      promises[i].then(resolve).catch(reject);
    }
  });
};

var Router = exports.Router = function () {
  function Router() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var maxQueryCost = _ref.maxQueryCost;
    var _ref$routes = _ref.routes;
    var routes = _ref$routes === undefined ? {} : _ref$routes;

    _classCallCheck(this, Router);

    this.maxQueryCost = maxQueryCost;
    this.routes = routes;
  }

  _createClass(Router, [{
    key: 'getRouteForPath',
    value: function getRouteForPath(path) {
      var routes = this.routes;

      var query = [];
      for (var i = 0, l = path.length; i < l; ++i) {
        query[i] = pathSegmentToRouteQuerySegment(path[i]);
      }

      for (var i = query.length; i > 0; --i) {
        var paths = queryToPaths(query.slice(0, i));
        for (var j = 0, l = paths.length; j < l; ++j) {
          var route = pathToRoute(paths[j]);
          var fn = routes[route];
          if (fn) return { route: route, fn: fn };
        }
      }

      throw new Error('No route matches ' + JSON.stringify(path));
    }
  }, {
    key: 'run',
    value: function run(_ref2) {
      var _this3 = this;

      var _ref2$query = _ref2.query;
      var query = _ref2$query === undefined ? [] : _ref2$query;
      var _ref2$context = _ref2.context;
      var context = _ref2$context === undefined ? {} : _ref2$context;
      var _ref2$force = _ref2.force;
      var force = _ref2$force === undefined ? false : _ref2$force;
      var _ref2$changes = _ref2.changes;
      var changes = _ref2$changes === undefined ? [] : _ref2$changes;
      var _ref2$store = _ref2.store;
      var store = _ref2$store === undefined ? new Store() : _ref2$store;
      var _ref2$onlyUnresolved = _ref2.onlyUnresolved;
      var onlyUnresolved = _ref2$onlyUnresolved === undefined ? false : _ref2$onlyUnresolved;

      return SyncPromise.resolve().then(function () {
        var limit = _this3.maxQueryCost;

        if (limit && getQueryCost(query, limit) > limit) {
          throw EXPENSIVE_QUERY_ERROR;
        }

        var paths = queryToPaths(query);
        if (!force) {
          var undefPaths = [];
          for (var i = 0, l = paths.length; i < l; ++i) {
            var path = paths[i];
            var resolved = store.resolvePath(path);
            if (onlyUnresolved && path === resolved) continue;
            if (store.get(resolved) === undefined) undefPaths.push(resolved);
          }
          paths = undefPaths;
        }

        if (!paths.length) return changes;

        var jobs = {};
        var unresolvedPaths = [];
        for (var i = 0, l = paths.length; i < l; ++i) {
          var path = paths[i];

          var _getRouteForPath = _this3.getRouteForPath(path);

          var route = _getRouteForPath.route;
          var fn = _getRouteForPath.fn;

          var params = routeToParams(route);

          if (path.length > params.length && route !== '*') {
            unresolvedPaths.push(path);
          }

          var jobKey = getJobKey(params, path);

          var job = jobs[jobKey];
          if (!job) {
            job = jobs[jobKey] = {
              fn: fn,
              args: { context: context, store: store, paths: [] },
              keys: {}
            };
          }

          var _job = job;
          var keys = _job.keys;
          var args = _job.args;

          args.paths.push(path);

          for (var _i3 = 0; _i3 < params.length; ++_i3) {
            var param = params[_i3];
            var arg = path[_i3];
            if (isPluralParam(param)) {
              if (!args[_i3]) {
                args[_i3] = [];
                keys[_i3] = {};
              }
              var key = toKey(arg);
              if (keys[_i3][key]) continue;
              args[_i3].push(arg);
              keys[_i3][key] = true;
            } else args[_i3] = arg;
          }
        }

        var work = [];
        for (var key in jobs) {
          var _jobs$key = jobs[key];
          var fn = _jobs$key.fn;
          var args = _jobs$key.args;

          work.push(SyncPromise.resolve(args).then(fn).then(function (obj) {
            var flattened = flatten(obj);
            for (var i = 0, l = flattened.length; i < l; ++i) {
              var change = flattened[i];
              if (!change) continue;

              var path = change.path;
              var value = change.value;

              if (!isArray(path) || !('value' in change)) continue;

              store.set(path, value);
              changes.push({ path: path, value: value });
            }
          }));
        }

        var runUnresolved = function runUnresolved() {
          return _this3.run({
            query: [unresolvedPaths],
            context: context,
            changes: changes,
            store: store,
            onlyUnresolved: true
          });
        };

        return SyncPromise.all(work).then(runUnresolved);
      });
    }
  }]);

  return Router;
}();

var Store = exports.Store = function () {
  function Store() {
    var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref3$cache = _ref3.cache;
    var cache = _ref3$cache === undefined ? {} : _ref3$cache;
    var _ref3$router = _ref3.router;
    var router = _ref3$router === undefined ? new Router() : _ref3$router;
    var _ref3$maxRefDepth = _ref3.maxRefDepth;
    var maxRefDepth = _ref3$maxRefDepth === undefined ? 3 : _ref3$maxRefDepth;

    _classCallCheck(this, Store);

    this.cache = cache;
    this.router = router;
    this.listeners = {};
    this.maxRefDepth = maxRefDepth;
  }

  _createClass(Store, [{
    key: 'resolveRefs',
    value: function resolveRefs(obj) {
      var depth = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      if (!isObject(obj)) return obj;

      if (isArray(obj)) {
        var _val2 = [];
        for (var i = 0, l = obj.length; i < l; ++i) {
          _val2.push(this.resolveRefs(obj[i], depth));
        }
        return _val2;
      }

      var $ref = obj.$ref;

      if ($ref) return this.get($ref, depth + 1);

      var val = {};
      for (var key in obj) {
        val[key] = this.resolveRefs(obj[key], depth);
      }return val;
    }
  }, {
    key: 'get',
    value: function get(path) {
      var depth = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      if (depth > this.maxRefDepth) return { $ref: path };
      var cursor = this.cache;
      for (var i = 0, l = path.length; i < l && cursor != null; ++i) {
        if (cursor = cursor[toKey(path[i])]) {
          var _cursor = cursor;
          var $ref = _cursor.$ref;

          if ($ref) cursor = this.get($ref, depth);
        }
      }
      return this.resolveRefs(cursor, depth);
    }
  }, {
    key: 'set',
    value: function set(path, value) {
      path = this.resolvePath(path.slice(0, -1)).concat(path[path.length - 1]);
      var cursor = this.cache;
      for (var i = 0, l = path.length; i < l; ++i) {
        var key = toKey(path[i]);
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
  }, {
    key: 'resolvePath',
    value: function resolvePath(path) {
      var cursor = this.cache;
      for (var i = 0, l = path.length; i < l && cursor != null; ++i) {
        if (cursor = cursor[toKey(path[i])]) {
          var _cursor2 = cursor;
          var $ref = _cursor2.$ref;

          if ($ref) return this.resolvePath($ref.concat(path.slice(i + 1)));
        }
      }
      return path;
    }
  }, {
    key: 'run',
    value: function run(options) {
      return this.router.run(_extends({}, options, { store: this }));
    }
  }, {
    key: 'triggerChange',
    value: function triggerChange() {
      if (!this.triggerChangeTimeoutId) {
        this.triggerChangeTimeoutId = setTimeout(this._triggerChange.bind(this));
      }
      return this;
    }
  }, {
    key: '_triggerChange',
    value: function _triggerChange() {
      delete this.triggerChangeTimeoutId;
      return this.trigger('change');
    }
  }, {
    key: 'on',
    value: function on(name, cb) {
      var listeners = this.listeners[name];
      if (!listeners) listeners = this.listeners[name] = [];
      listeners.push(cb);
      return this;
    }
  }, {
    key: 'off',
    value: function off(name, cb) {
      if (!name) this.listeners = {};
      if (!cb) delete this.listeners[name];
      var listeners = this.listeners[name];
      if (!listeners) return this;
      var newListeners = this.listeners[name] = [];
      for (var i = 0, l = listeners.length; i < l; ++i) {
        if (listeners[i] !== cb) newListeners.push(listeners[i]);
      }
      if (!newListeners.length) delete this.listeners[name];
      return this;
    }
  }, {
    key: 'trigger',
    value: function trigger(name, data, cb) {
      var listeners = this.listeners[name];
      if (!listeners) return this;
      for (var i = 0, l = listeners.length; i < l; ++i) {
        listeners[i](data, cb);
      }return this;
    }
  }]);

  return Store;
}();
