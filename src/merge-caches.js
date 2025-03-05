import { isObject } from '#src/is-object.js';
import { mergeRefs } from '#src/merge-refs.js';

const { isArray } = Array;

/**
 * @param {{ [K: string]: any }} a
 * @param {{ [K: string]: any }} b
 * @param {true} [isCacheRoot]
 */
const _mergeCaches = (a, b, isCacheRoot) => {
  if (
    !isObject(a) ||
    !isObject(b) ||
    isArray(a) ||
    isArray(b) ||
    (b._type === undefined && !isCacheRoot) ||
    isArray(b._type)
  ) {
    return mergeRefs(b, a);
  }

  let c = a;
  for (const k in b) {
    const v = _mergeCaches(a[k], b[k]);
    if (v !== a[k]) {
      if (c === a) c = { ...a };
      c[k] = v;
    }
  }
  return c;
};

/**
 * @param {{ [K: string]: any }} a
 * @param {{ [K: string]: any }} b
 */
export const mergeCaches = (a, b) => _mergeCaches(a, b, true);
