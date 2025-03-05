/** @import {Query} from '#src/index.js' */

import { isObject } from '#src/is-object.js';

const { isArray } = Array;

/**
 * @template {any} T
 * @param {T} obj
 * @returns {T}
 */
const orderObject = obj => {
  if (!isObject(obj)) return obj;

  if (isArray(obj)) return /** @type {T} */ (obj.map(orderObject));

  const keys = /** @type {(keyof T)[]} */ (Object.keys(obj).sort());
  const val = /** @type {T} */ ({});
  const l = keys.length;
  for (let i = 0; i < l; ++i) {
    const k = keys[i];
    val[k] = /** @type {T[keyof T]} } */ (orderObject(obj[k]));
  }
  return val;
};

/** @param {{ alias: string; query: Query }} options */
export const normalizeKey = ({ alias, query: { _, $ } }) =>
  (_ ?? alias) + ($ === undefined ? '' : `(${JSON.stringify(orderObject($))})`);
