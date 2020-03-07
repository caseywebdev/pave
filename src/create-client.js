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
      const { isPartial, data } = cacheExecute({
        data: cache.data,
        key,
        query: inject({ injection, query })
      });
      return !isPartial || allowPartial ? data : null;
    },

    update: ({ data, key, query }) => {
      const next = merge(
        cache.data,
        normalize({ data, getKey, key, query: inject({ injection, query }) })
      );
      if (next === cache.data) return cache;

      const prev = cache.data;
      cache.data = next;
      triggerWatchers({ getKey, next, prev, watchers });
      return cache;
    },

    watch: ({ allowPartial = false, key, onChange, query }) => {
      let watcher;
      if (query) {
        query = inject({ injection, query });
        watcher = {
          allowPartial,
          data: normalize({
            data: cache.execute({ allowPartial: true, key, query }),
            getKey,
            key,
            query
          }),
          key,
          onChange,
          query
        };
      } else {
        watcher = { onChange };
      }
      watchers.add(watcher);
      return () => watchers.delete(watcher);
    }
  };
  return cache;
};
