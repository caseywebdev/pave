import isObject from './is-object.js';
import merge from './merge.js';

const { isArray } = Array;

const mergeCaches = (a, b, isCacheRoot) => {
  if (
    !isObject(a) ||
    !isObject(b) ||
    isArray(a) ||
    isArray(b) ||
    (b._type === undefined && !isCacheRoot) ||
    isArray(b._type)
  ) {
    return merge(b, a);
  }

  let c = a;
  for (const k in b) {
    const v = mergeCaches(a[k], b[k]);
    if (v !== a[k]) {
      if (c === a) c = { ...a };
      c[k] = v;
    }
  }
  return c;
};

export default (a, b) => mergeCaches(a, b, true);
