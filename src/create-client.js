import cacheExecute from './cache-execute.js';
import injectType from './inject-type.js';
import mergeCaches from './merge-caches.js';
import mergeRefs from './merge-refs.js';
import normalize from './normalize.js';

const identity = v => v;

export default ({
  cache,
  execute,
  getKey,
  transformQuery = injectType
} = {}) => {
  transformQuery ??= identity;
  const watchers = new Set();
  let currentUpdate;

  const client = {
    cache: cache ?? {},

    cacheExecute: ({ key, query }) =>
      cacheExecute({
        cache: client.cache,
        key,
        query: key ? query : transformQuery(query)
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

        const newData = mergeRefs(client.cacheExecute({ query }), data);
        if (newData !== data) onChange((watcher.data = newData));
      });

      return client;
    },

    execute: async ({ query, ...args }) => {
      query = transformQuery(query);
      const data = await execute({ query, ...args });
      client.update({ data, query });
      return data;
    },

    update: ({ data, query }) => {
      query = transformQuery(query);
      data = normalize({ data, getKey, query });
      return client.cacheUpdate({ data });
    },

    watch: ({ data, onChange, query }) => {
      const watcher = { onChange };
      watchers.add(watcher);
      const unwatch = () => watchers.delete(watcher);
      if (!query) return { unwatch };

      watcher.query = query = transformQuery(query);
      watcher.data = data = mergeRefs(client.cacheExecute({ query }), data);
      return { data, unwatch };
    }
  };

  return client;
};
