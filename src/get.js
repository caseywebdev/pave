import getRaw from './get-raw';
import resolvePath from './resolve-path';
import resolveRefs from './resolve-refs';
import toKey from './to-key';

export default (cache, path, visited = {}) => {
  path = resolvePath(cache, path);
  const key = toKey(path);
  return visited[key] || resolveRefs(cache, getRaw(cache, path), visited, key);
};
