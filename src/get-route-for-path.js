import pathKeyToRouteQueryKey from './path-key-to-route-query-key';
import pathToRoute from './path-to-route';
import queryToPaths from './query-to-paths';

export default (routes, path) => {
  const query = [];
  for (let i = 0, l = path.length; i < l; ++i) {
    query[i] = pathKeyToRouteQueryKey(path[i]);
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
};
