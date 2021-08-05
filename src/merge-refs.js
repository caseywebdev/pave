import isArray from './is-array.js';
import isObject from './is-object.js';

const merge = (a, b) => {
  if (a === b || !isObject(a) || !isObject(b) || isArray(a) !== isArray(b)) {
    return a;
  }

  const d = isArray(a) ? [] : {};
  let c = Object.keys(a).length === Object.keys(b).length ? b : d;
  for (const k in a) {
    d[k] = merge(a[k], b[k]);
    if (d[k] !== b[k]) c = d;
  }
  return c;
};

export default merge;
