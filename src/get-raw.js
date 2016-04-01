import toKey from './to-key';

const getRaw = (cache, path) => {
  let cursor = cache;
  for (let i = 0, l = path.length; i < l && cursor != null; ++i) {
    if (cursor = cursor[toKey(path[i])]) {
      const {$ref} = cursor;
      if ($ref && i < l - 1) cursor = getRaw(cache, $ref);
    }
  }
  return cursor;
};

export default getRaw;
