import isEqual from './is-equal';
import toKey from './to-key';

export default (watchers, prev, next, delta) => {
  const cache = {};
  for (let i = 0, l = watchers.length; i < l; ++i) {
    const {paths, cb} = watchers[i];
    for (let j = 0, m = paths.length; j < m; ++j) {
      const path = paths[j];
      const key = toKey(path);
      if (cache[key] == null) cache[key] = isEqual(path, prev, next);
      if (!cache[key]) {
        cb(prev, delta);
        break;
      }
    }
  }
};
