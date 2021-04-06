import isArray from './is-array.js';
import isEqual from './is-equal.js';
import isObject from './is-object.js';

const merge = (a, b, isCacheRoot) => {
  if (
    !isObject(a) ||
    !isObject(b) ||
    isArray(a) ||
    isArray(b) ||
    (b._type === undefined && !isCacheRoot) ||
    b._type === '_ref'
  ) {
    return isEqual(a, b) ? a : b;
  }

  let c = a;
  for (const k in b) {
    const v = merge(a[k], b[k]);
    if (v !== a[k]) {
      if (c === a) c = { ...a };
      c[k] = v;
    }
  }
  return c;
};

export default (a, b) => merge(a, b, true);
