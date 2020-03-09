import cacheExecute from './cache-execute.js';
import isEqual from './is-equal.js';

export default ({ a, b, watchers }) => {
  if (a === b) return;

  watchers.forEach(watcher => {
    const { onChange, query } = watcher;
    if (!query) return onChange(b);

    const aData = cacheExecute({ cache: a, query });
    const bData = cacheExecute({ cache: b, query });
    if (!isEqual(aData, bData)) onChange(bData);
  });
};
