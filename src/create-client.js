import cacheExecute from './cache-execute.js';
import ensureObject from './ensure-object.js';
import inject from './inject.js';
import merge from './merge.js';
import normalize from './normalize.js';
import triggerWatchers from './trigger-watchers.js';

export default ({ data, fetch, getKey, injection } = {}) => {
  const watchers = new Set();
  const client = {
    data: data || { _root: {} },

    fetch: async ({ context, query }) => {
      if (!fetch) return;

      if (injection) query = inject({ injection, query });
      const data = await fetch({ context: ensureObject(context), query });
      client.update({ query, data });
      return data;
    },

    execute: ({ allowPartial = false, key, query }) => {
      if (injection) query = inject({ injection, query });
      const { isPartial, data } = cacheExecute({
        data: client.data,
        key,
        query
      });
      return !isPartial || allowPartial ? data : null;
    },

    update: ({ data, key, query }) => {
      if (query) {
        if (injection) query = inject({ injection, query });
        data = normalize({ data, getKey, key, query });
      }
      const next = merge(client.data, data);
      if (next === client.data) return client;

      const prev = client.data;
      client.data = next;
      triggerWatchers({ getKey, next, prev, watchers });
      return client;
    },

    watch: ({ allowPartial = false, key, onChange, query }) => {
      let watcher = { onChange };
      if (query) {
        query = inject({ injection, query });
        let data = client.execute({ allowPartial: true, key, query });
        data = normalize({ data, getKey, key, query });
        watcher = { allowPartial, data, key, onChange, query };
      }
      watchers.add(watcher);
      return () => watchers.delete(watcher);
    }
  };
  return client;
};
