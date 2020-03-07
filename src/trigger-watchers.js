import cacheExecute from './cache-execute.js';
import normalize from './normalize.js';

const didChange = ({ data, next, prev }) => {
  if (!Object.keys(data || {}).length && prev !== next) return true;

  for (const k1 in data) {
    const prevV1 = prev && prev[k1];
    const nextV1 = next && next[k1];
    if (!Object.keys(data[k1] || {}).length && prevV1 !== nextV1) return true;

    for (const k2 in data[k1]) {
      if ((prevV1 && prevV1[k2]) !== (nextV1 && nextV1[k2])) return true;
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
