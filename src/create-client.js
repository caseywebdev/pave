import cacheExecute from './cache-execute.js';
import ensureObject from './ensure-object.js';
import inject from './inject.js';
import isEqual from './is-equal.js';
import mergeCaches from './merge-caches.js';
import normalize from './normalize.js';

export default ({ cache, execute, getKey, injection } = {}) => {
  const watchers = new Set();

  const client = {
    cache: cache || { _root: {} },

    cacheExecute: args => cacheExecute({ cache: client.cache, ...args }),

    cacheUpdate: ({ data }) => {
      const prev = client.cache;
      client.cache = mergeCaches(client.cache, data);
      if (client.cache === prev) return client;

      watchers.forEach(watcher => {
        const { data, onChange, query } = watcher;
        if (!query) return onChange(client.cache);

        const newData = client.cacheExecute({ query });
        if (!isEqual(data, newData)) onChange((watcher.data = newData));
      });
      return client;
    },

    execute: async ({ context, query }) => {
      if (!execute) return;

      if (injection) query = inject({ injection, query });
      const data = await execute({ context: ensureObject(context), query });
      client.update({ query, data });
      return data;
    },

    update: ({ data, query }) =>
      client.cacheUpdate({ data: normalize({ data, getKey, query }) }),

    watch: ({ onChange, query }) => {
      const data = query && client.cacheExecute({ query });
      const watcher = { data, onChange, query };
      watchers.add(watcher);
      return () => watchers.delete(watcher);
    }
  };

  return client;
};
