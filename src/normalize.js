/** @import {Query} from '#src/index.js'; */

import { isObject } from '#src/is-object.js';
import { normalizeKey } from '#src/normalize-key.js';
import { normalizeRoot } from '#src/normalize-root.js';

const { isArray } = Array;

/**
 * @param {{
 *   data: any;
 *   getKey?: (data: any) => string;
 *   normalized: { [K: string]: any };
 *   query: Query;
 * }} options
 */
const walk = ({ data, getKey, normalized = {}, query }) => {
  if (isArray(data)) {
    return data.map(data => walk({ data, getKey, normalized, query }));
  }

  if (!isObject(data) || data._type === undefined) return data;

  const key = getKey?.(data);
  const obj = key ? (normalized[key] ??= {}) : {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let { _, $, ..._query } = query;
  _query = _query[`_on_${data._type}`] ?? _query;
  for (const alias in _query) {
    if (data[alias] === undefined) continue;

    const query = _query[alias];
    const key = normalizeKey({ alias, query });
    const value = walk({ data: data[alias], getKey, normalized, query });
    obj[key] =
      isObject(value) && !isArray(value) && !isArray(value._type)
        ? { ...obj[key], ...value }
        : value;
  }

  return key ? { _type: [key] } : obj;
};

/** @param {{ data: any; getKey: (data: any) => string; query: Query }} options */
export const normalize = ({ data, getKey, query }) => {
  const normalized = {};
  normalized[normalizeRoot({ query })] = walk({
    data,
    getKey,
    normalized,
    query
  });
  return normalized;
};
