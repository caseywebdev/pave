import cacheExecute from './cache-execute.js';
import injectType from './inject-type.js';
import mergeCaches from './merge-caches.js';
import merge from './merge.js';
import normalize from './normalize.js';

const { Set } = globalThis;

const defaultTransform = ({ query }) => injectType(query);
const noopTransform = ({ query }) => query;

export default ({ cache, execute, getKey, transformQuery } = {}) => {
  if (transformQuery === undefined) transformQuery = defaultTransform;
  else if (transformQuery === null) transformQuery = noopTransform;
  const watchers = new Set();
  let currentUpdate;

  const client = {
    cache: cache ?? {},

    cacheExecute: ({ key, query }) =>
      cacheExecute({
        cache: client.cache,
        key,
        query: transformQuery({ key, query })
      }),

    cacheUpdate: ({ data }) => {
      const prev = client.cache;
      client.cache = mergeCaches(prev, data);
      if (client.cache === prev) return client;

      const thisUpdate = (currentUpdate = {});

      watchers.forEach(watcher => {
        if (thisUpdate !== currentUpdate) return;

        const { data, onChange, query } = watcher;
        if (!query) return onChange(client.cache);

        const newData = merge(client.cacheExecute({ query }), data);
        if (newData !== data) onChange((watcher.data = newData));
      });

      return client;
    },

    execute: async ({ query, ...rest }) => {
      query = transformQuery({ query });
      const data = await execute({ query, ...rest });
      client.update({ data, query });
      return data;
    },

    update: ({ data, query }) => {
      query = transformQuery({ query });
      data = normalize({ data, getKey, query });
      return client.cacheUpdate({ data });
    },

    watch: ({ data, onChange, query }) => {
      const watcher = { onChange };
      watchers.add(watcher);
      const unwatch = () => watchers.delete(watcher);
      if (!query) return { unwatch };

      watcher.query = query = transformQuery({ query });
      watcher.data = data = merge(client.cacheExecute({ query }), data);
      return { data, unwatch };
    }
  };

  return client;
};
