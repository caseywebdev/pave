import cacheExecute from './cache-execute.js';
import inject from './inject.js';
import merge from './merge.js';
import normalize from './normalize.js';
import triggerWatchers from './trigger-watchers.js';

export default ({ data, getKey, injection } = {}) => {
  const watchers = new Set();
  const cache = {
    data: data || { _root: {} },

    execute: ({ allowPartial = false, key, query }) => {
      if (injection) query = inject({ injection, query });
      const { isPartial, data } = cacheExecute({
        data: cache.data,
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
      const next = merge(cache.data, data);
      if (next === cache.data) return cache;

      const prev = cache.data;
      cache.data = next;
      triggerWatchers({ getKey, next, prev, watchers });
      return cache;
    },

    watch: ({ allowPartial = false, key, onChange, query }) => {
      let watcher = { onChange };
      if (query) {
        query = inject({ injection, query });
        data = cache.execute({ allowPartial: true, key, query });
        data = normalize({ data, getKey, key, query });
        watcher = { allowPartial, data, key, onChange, query };
      }
      watchers.add(watcher);
      return () => watchers.delete(watcher);
    }
  };
  return cache;
};
