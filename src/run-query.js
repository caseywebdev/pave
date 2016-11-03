import getJobKey from './get-job-key';
import getQueryCost from './get-query-cost';
import getRouteForPath from './get-route-for-path';
import isInTree from './is-in-tree';
import isPluralParam from './is-plural-param';
import partitionMutationsAndReads from './partition-mutations-and-reads';
import pathsToTree from './paths-to-tree';
import queryToPaths from './query-to-paths';
import resolvePath from './resolve-path';
import routeToParams from './route-to-params';
import Store from './store';
import Promise from 'better-promise';
import toKey from './to-key';
import treeToQuery from './tree-to-query';

const runQuery = ({
  query = [],
  force = false,
  deltas = [],
  store = new Store(),
  onlyUnresolved = false,
  maxQueryCost = 0,
  routes = {}
} = {}) =>
  Promise.resolve().then(() => {
    if (maxQueryCost && getQueryCost(query, maxQueryCost) > maxQueryCost) {
      throw new Error('Query is too expensive');
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

    const {mutations, reads} = partitionMutationsAndReads(paths);
    if (mutations.length) {
      paths = mutations;
      query = [reads];
      onlyUnresolved = false;
    } else {
      query = [paths];
      force = false;
      onlyUnresolved = true;
    }

    const jobs = {};
    for (let i = 0, l = paths.length; i < l; ++i) {
      const path = paths[i];
      const {route, fn} = getRouteForPath(routes, path);
      const params = routeToParams(route);
      const jobKey = getJobKey(params, path);
      let job = jobs[jobKey];
      if (!job) job = jobs[jobKey] = {fn, paths: [], args: {store}, keys: {}};

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
      args.query = treeToQuery(pathsToTree(paths));
      work.push(Promise.resolve(args).then(fn).then(newDeltas => {
        store.update(newDeltas);
        deltas.push(newDeltas);
      }));
    }

    return Promise.all(work).then(() =>
      runQuery({
        deltas,
        force,
        maxQueryCost,
        onlyUnresolved,
        query,
        routes,
        store
      })
    );
  });

export default runQuery;
