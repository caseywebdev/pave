import getJobKey from './get-job-key';
import getQueryCost from './get-query-cost';
import isInTree from './is-in-tree';
import isPluralParam from './is-plural-param';
import pathSegmentToRouteQuerySegment
  from './path-segment-to-route-query-segment';
import pathsToTree from './paths-to-tree';
import pathToRoute from './path-to-route';
import queryToPaths from './query-to-paths';
import resolvePath from './resolve-path';
import routeToParams from './route-to-params';
import Store from './store';
import SyncPromise from './sync-promise';
import toKey from './to-key';
import treeToQuery from './tree-to-query';

export default class Router {
  static EXPENSIVE_QUERY_ERROR = new Error('Query is too expensive');

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
    force,
    deltas = [],
    store = new Store(),
    onlyUnresolved = false
  }) {
    return SyncPromise.resolve().then(() => {
      const {maxQueryCost: limit} = this;
      if (limit && getQueryCost(query, limit) > limit) {
        throw Router.EXPENSIVE_QUERY_ERROR;
      }

      let paths = queryToPaths(query);
      if (force !== true) {
        const forceTree = pathsToTree(force ? queryToPaths(force) : []);
        const undefPaths = [];
        for (let i = 0, l = paths.length; i < l; ++i) {
          const path = paths[i];
          const resolved = resolvePath(store.cache, path);
          if (onlyUnresolved && path === resolved) continue;

          const isUndef = store.get(resolved) === undefined;
          if (isUndef || isInTree(path, forceTree)) undefPaths.push(resolved);
        }
        paths = undefPaths;
      }

      if (!paths.length) return deltas;

      const jobs = {};
      for (let i = 0, l = paths.length; i < l; ++i) {
        const path = paths[i];
        const {route, fn} = this.getRouteForPath(path);
        const params = routeToParams(route);
        const jobKey = getJobKey(params, path);
        let job = jobs[jobKey];
        if (!job) {
          job = jobs[jobKey] = {fn, paths: [], args: {store}, keys: {}};
        }

        job.paths.push(path);

        const {keys, args} = job;
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
        const {fn, paths, args} = jobs[key];
        args.query = treeToQuery(pathsToTree(paths))
        work.push(SyncPromise.resolve(args).then(fn).then(newDeltas => {
          store.update(newDeltas);
          deltas.push(newDeltas);
        }));
      }

      const runUnresolved = () =>
        this.run({query: [paths], deltas, store, onlyUnresolved: true});

      return SyncPromise.all(work).then(runUnresolved);
    });
  }
}
