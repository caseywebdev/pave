/** @import {Query} from '#src/index.js' */

import { isObject } from '#src/is-object.js';

/**
 * @template {Query} T
 * @param {T} query
 */
export const injectType = query => {
  if (!isObject(query)) return query;

  const initial = query;
  for (const key in initial) {
    if (key === '_' || key === '_type' || key === '$') continue;

    if (query === initial) query = { _type: {}, ...query };
    query[key] = injectType(query[key]);
  }

  return query;
};
