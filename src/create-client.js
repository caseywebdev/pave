import cacheExecute from './cache-execute.js';
import ensureObject from './ensure-object.js';
import inject from './inject.js';
import mergeCaches from './merge-caches.js';
import normalize from './normalize.js';
import triggerWatchers from './trigger-watchers.js';

export default ({ cache, execute, getKey, injection } = {}) => {
  const watchers = new Set();

  const client = {
    cache: cache || { _root: {} },

    cacheExecute: args => cacheExecute({ cache: client.cache, ...args }),

    cacheUpdate: ({ data }) => {
      const a = client.cache;
      const b = (client.cache = mergeCaches(client.cache, data));
      triggerWatchers({ a, b, watchers });
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
      const watcher = { onChange, query };
      watchers.add(watcher);
      return () => watchers.delete(watcher);
    }
  };

  return client;
};
