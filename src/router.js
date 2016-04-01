import flatten from './flatten';
import getJobKey from './get-job-key';
import getQueryCost from './get-query-cost';
import isPluralParam from './is-plural-param';
import pathSegmentToRouteQuerySegment
  from './path-segment-to-route-query-segment';
import pathToRoute from './path-to-route';
import queryToPaths from './query-to-paths';
import resolvePath from './resolve-path';
import routeToParams from './route-to-params';
import Store from './store';
import SyncPromise from './sync-promise';
import toKey from './to-key';

const EXPENSIVE_QUERY_ERROR = new Error('Query is too expensive');

export default class Router {
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
    deltas = [],
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
          const resolved = resolvePath(store.cache, path);
          if (onlyUnresolved && path === resolved) continue;
          if (store.get(resolved) === undefined) undefPaths.push(resolved);
        }
        paths = undefPaths;
      }

      if (!paths.length) return deltas;

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
        work.push(SyncPromise.resolve(args).then(fn).then(newDeltas => {
          store.update(newDeltas);
          deltas.push(newDeltas);
        }));
      }

      const runUnresolved = () =>
        this.run({
          query: [unresolvedPaths],
          context,
          deltas,
          store,
          onlyUnresolved: true
        });

      return SyncPromise.all(work).then(runUnresolved);
    });
  }
}
