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

var queryToPaths = exports.queryToPaths = function queryToPaths(query) {
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

var getQueryCost = exports.getQueryCost = function getQueryCost(query) {
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

var routeToQuery = function routeToQuery(route) {
  var path = route.split('.');
  for (var i = 0, l = path.length; i < l; ++i) {
    path[i] = path[i].split('|');
  }return path;
};

var pathToRoute = function pathToRoute(path) {
  return path.join('.');
};

var pathSegmentToRouteQuerySegment = function pathSegmentToRouteQuerySegment(segment) {
  return isObject(segment) ? '$params' : [segment, '$key'];
};

var flattenRoutes = function flattenRoutes(routes) {
  var flattened = {};
  for (var route in routes) {
    var fn = routes[route];
    var paths = queryToPaths(routeToQuery(route));
    for (var i = 0, l = paths.length; i < l; ++i) {
      var path = paths[i];
      var _route = pathToRoute(path);
      flattened[_route] = { fn: fn, arity: _route === '*' ? 0 : path.length };
    }
  }
  return flattened;
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

var nextFnid = 1;
var getFnid = function getFnid(fn) {
  return fn.__FNID__ || (fn.__FNID__ = nextFnid++);
};

var ROUTE_NOT_FOUND_ERROR = new Error('Route not found');
var EXPENSIVE_QUERY_ERROR = new Error('Query is too expensive');
var DEFAULT_ROUTES = { '*': function _() {
    throw ROUTE_NOT_FOUND_ERROR;
  } };

var Router = exports.Router = function () {
  function Router() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var maxQueryCost = _ref.maxQueryCost;
    var _ref$routes = _ref.routes;
    var routes = _ref$routes === undefined ? DEFAULT_ROUTES : _ref$routes;

    _classCallCheck(this, Router);

    this.routes = flattenRoutes(routes);
    if (maxQueryCost) this.maxQueryCost = maxQueryCost;
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
          var route = routes[pathToRoute(paths[j])];
          if (route) return route;
        }
      }

      return routes['*'];
    }
  }, {
    key: 'run',
    value: function run(_ref2) {
      var _this = this;

      var _ref2$query = _ref2.query;
      var query = _ref2$query === undefined ? [] : _ref2$query;
      var _ref2$context = _ref2.context;
      var context = _ref2$context === undefined ? {} : _ref2$context;
      var _ref2$force = _ref2.force;
      var force = _ref2$force === undefined ? false : _ref2$force;
      var _ref2$change = _ref2.change;
      var change = _ref2$change === undefined ? [] : _ref2$change;
      var _ref2$store = _ref2.store;
      var store = _ref2$store === undefined ? new Store() : _ref2$store;
      var _ref2$onlyUnresolved = _ref2.onlyUnresolved;
      var onlyUnresolved = _ref2$onlyUnresolved === undefined ? false : _ref2$onlyUnresolved;

      return Promise.resolve().then(function () {
        var limit = _this.maxQueryCost;

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

        if (!paths.length) return change;

        var jobs = {};
        var unresolvedPaths = [];
        for (var i = 0, l = paths.length; i < l; ++i) {
          var path = paths[i];
          var route = _this.getRouteForPath(path);
          if (!route) continue;
          var fn = route.fn;
          var arity = route.arity;


          if (path.length > arity && arity > 0) unresolvedPaths.push(path);

          var fnid = getFnid(fn);
          var job = jobs[fnid];
          if (!job) {
            job = jobs[fnid] = {
              fn: fn,
              options: { context: context, store: store, paths: [] },
              keys: []
            };
          }

          var _job = job;
          var keys = _job.keys;
          var options = _job.options;

          options.paths.push(path);

          for (var _i3 = 0; _i3 < arity; ++_i3) {
            if (!options[_i3]) {
              options[_i3] = [];
              keys[_i3] = {};
            }
            var segment = path[_i3];
            var key = toKey(segment);
            if (keys[_i3][key]) continue;
            options[_i3].push(segment);
            keys[_i3][key] = true;
          }
        }

        var work = [];
        for (var fnid in jobs) {
          var _jobs$fnid = jobs[fnid];
          var fn = _jobs$fnid.fn;
          var options = _jobs$fnid.options;

          work.push(Promise.resolve(options).then(fn).then(function (newChange) {
            store.applyChange(newChange);
            change.push(newChange);
          }));
        }

        var recurse = function recurse() {
          return _this.run({
            query: [unresolvedPaths],
            context: context,
            change: change,
            store: store,
            onlyUnresolved: true
          });
        };

        return Promise.all(work).then(recurse);
      });
    }
  }]);

  return Router;
}();

var DEFAULT_ROUTER = new Router();

var Store = exports.Store = function () {
  function Store() {
    var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref3$cache = _ref3.cache;
    var cache = _ref3$cache === undefined ? {} : _ref3$cache;
    var _ref3$router = _ref3.router;
    var router = _ref3$router === undefined ? DEFAULT_ROUTER : _ref3$router;
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
    key: 'applyChange',
    value: function applyChange(change) {
      if (!change) return;
      if (!isArray(change)) return this.set(change.path, change.value);
      for (var i = 0, l = change.length; i < l; ++i) {
        this.applyChange(change[i]);
      }return this;
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
