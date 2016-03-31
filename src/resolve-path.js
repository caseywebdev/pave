import toKey from './to-key';

const resolvePath = (cache, path) => {
  let cursor = cache;
  for (let i = 0, l = path.length; i < l && cursor != null; ++i) {
    if (cursor = cursor[toKey(path[i])]) {
      const {$ref} = cursor;
      if ($ref) return resolvePath(cache, $ref.concat(path.slice(i + 1)));
    }
  }
  return path;
};

export default resolvePath;
