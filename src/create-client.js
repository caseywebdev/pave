/** @import {Query} from '#src/index.js' */

import { cacheExecute } from '#src/cache-execute.js';
import { injectType } from '#src/inject-type.js';
import { mergeCaches } from '#src/merge-caches.js';
import { mergeRefs } from '#src/merge-refs.js';
import { normalize } from '#src/normalize.js';

const { Set } = globalThis;

/** @param {{ query: Query }} options */
const defaultTransform = ({ query }) => injectType(query);

/** @param {{ query: Query }} options */
const noopTransform = ({ query }) => query;

/**
 * @param {{
 *   cache?: { [K: string]: any };
 *   execute?: (options: { query: Query; [K: string]: any }) => any;
 *   getKey?: (value: any) => string;
 *   transformQuery?: (options: { query: Query }) => Query;
 * }} [options]
 */
export const createClient = ({
  cache,
  execute,
  getKey,
  transformQuery
} = {}) => {
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

        const newData = mergeRefs(client.cacheExecute({ query }), data);
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
      watcher.data = data = mergeRefs(client.cacheExecute({ query }), data);
      return { data, unwatch };
    }
  };

  return client;
};
