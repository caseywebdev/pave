import { isObject } from '#src/is-object.js';

const { isArray } = Array;

/**
 * @template T
 * @param {T} a
 * @param {NoInfer<T>} b
 */
export const mergeRefs = (a, b) => {
  if (a === b || !isObject(a) || !isObject(b)) return a;

  if (isArray(a)) {
    if (!isArray(b)) return a;

    const l = a.length;
    const d = /** @type {T} */ (new Array(l));
    let c = l === b.length ? b : d;
    for (let i = 0; i < l; ++i) {
      if ((d[i] = mergeRefs(a[i], b[i])) !== b[i]) c = d;
    }
    return c;
  }

  if (isArray(b)) return a;

  const d = /** @type {T} */ ({});
  const keys = /** @type {(keyof T)[]} */ (Object.keys(a));
  const l = keys.length;
  let c = l === Object.keys(b).length ? b : d;
  for (let i = 0; i < l; ++i) {
    const k = keys[i];
    if ((d[k] = mergeRefs(a[k], b[k])) !== b[k]) c = d;
  }
  return c;
};
