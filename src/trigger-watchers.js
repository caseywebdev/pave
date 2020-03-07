import cacheExecute from './cache-execute.js';
import normalize from './normalize.js';

const didChange = ({ data, next, prev }) => {
  if (next === prev) return false;

  if (!Object.keys(data || {}).length) return true;

  for (const k1 in data) {
    const pv1 = prev && prev[k1];
    const nv1 = next && next[k1];
    if (pv1 === nv1) return false;

    if (!Object.keys(data[k1] || {}).length) return true;

    for (const k2 in data[k1]) {
      if ((pv1 && pv1[k2]) !== (nv1 && nv1[k2])) return true;
    }
  }

  return false;
};

export default ({ watchers, getKey, prev, next }) => {
  watchers.forEach(watcher => {
    const { allowPartial, data, key, onChange, query } = watcher;
    if (!query) return onChange(next);

    if (!didChange({ data, next, prev })) return;

    const { isPartial, data: _data } = cacheExecute({
      data: next,
      key,
      query
    });
    watcher.data = normalize({ data: _data, getKey, key, query });
    if (!isPartial || allowPartial) onChange(_data);
  });
};
