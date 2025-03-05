/** @import {Query} from '#src/index.js' */

import { isObject } from '#src/is-object.js';
import { normalizeKey } from '#src/normalize-key.js';
import { normalizeRoot } from '#src/normalize-root.js';

const { isArray } = Array;

/**
 * @param {{ cache: { [K: string]: any }; query: Query; value: any }} options
 * @returns {any}
 */
const walk = ({ cache, query, value }) => {
  while (true) {
    if (isArray(value)) {
      const allResolved = [];
      const l = value.length;
      for (let i = 0; i < l; ++i) {
        const resolved = walk({ cache, query, value: value[i] });
        if (resolved === undefined) return;

        allResolved.push(resolved);
      }
      return allResolved;
    }

    if (!isObject(value) || value._type === undefined) return value;

    if (isArray(value._type)) {
      value = cache[value._type[0]];
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let { _, $, ..._query } = query;
    _query = _query[`_on_${value._type}`] ?? _query;
    const data = /** @type {typeof _query} */ ({});
    for (const alias in _query) {
      if (alias.startsWith('_on_')) continue;

      const query = _query[alias];
      const key = normalizeKey({ alias, query });
      const resolved = walk({ cache, query, value: value[key] });
      if (resolved === undefined) return;

      data[alias] = resolved;
    }
    return data;
  }
};

/** @param {{ cache: { [K: string]: any }; key?: string; query: Query }} options */
export const cacheExecute = ({ cache, key, query }) =>
  walk({ cache, query, value: cache[key ?? normalizeRoot({ query })] });
