import resolveRefs from './resolve-refs';
import toKey from './to-key';

const get = (cache, path, maxDepth = 3, depth = 0) => {
  if (depth > maxDepth) return {$ref: path};
  let cursor = cache;
  for (let i = 0, l = path.length; i < l && cursor != null; ++i) {
    if (cursor = cursor[toKey(path[i])]) {
      const {$ref} = cursor;
      if ($ref && (maxDepth || i < l - 1)) {
        cursor = get(cache, $ref, maxDepth, depth);
      }
    }
  }
  return maxDepth ? resolveRefs(cache, cursor, maxDepth, depth) : cursor;
};

export default get;
