import cacheExecute from './cache-execute.js';
import injectType from './inject-type.js';
import mergeCaches from './merge-caches.js';
import mergeRefs from './merge-refs.js';
import normalize from './normalize.js';

const { Set } = globalThis;

const noopTransform = ({ query }) => query;

export default ({ cache, execute, getRef, transformQuery } = {}) => {
  if (transformQuery === undefined) transformQuery = injectType;
  else if (transformQuery === null) transformQuery = noopTransform;
  const watchers = new Set();
  let currentUpdate;

  const client = {
    cache: cache ?? {},

    cacheExecute: ({ ref, query }) =>
      cacheExecute({
        cache: client.cache,
        query: transformQuery({ query, ref }),
        ref
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

    execute: async ({ query, ...arg }) => {
      query = transformQuery({ query });
      const data = await execute({ query, ...arg });
      client.update({ data, query });
      return data;
    },

    update: ({ data, query }) => {
      query = transformQuery({ query });
      data = normalize({ data, getRef, query });
      return client.cacheUpdate({ data });
    },

    watch: ({ data, onChange, query }) => {
      const watcher = { onChange };
      watchers.add(watcher);
      const unwatch = () => watchers.delete(watcher);
      if (!query) return { unwatch };

      watcher.query = query = transformQuery({ query });
      watcher.data = data = mergeRefs(client.cacheExecute({ query }), data);
      return { data, unwatch };
    }
  };

  return client;
};
