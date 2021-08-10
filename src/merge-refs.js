import isArray from './is-array.js';
import isObject from './is-object.js';

const merge = (a, b) => {
  if (a === b || !isObject(a) || !isObject(b)) return a;

  if (isArray(a)) {
    if (!isArray(b)) return a;

    const l = a.length;
    const d = new Array(l);
    let c = l === b.length ? b : d;
    for (let i = 0; i < l; ++i) {
      const bV = b[i];
      const v = merge(a[i], bV);
      d[i] = v;
      if (v !== bV) c = d;
    }
    return c;
  }

  if (isArray(b)) return a;

  const d = {};
  const keys = Object.keys(a);
  const l = keys.length;
  let c = l === Object.keys(b).length ? b : d;
  for (let i = 0; i < l; ++i) {
    const k = keys[i];
    const bV = b[k];
    const v = merge(a[k], bV);
    d[k] = v;
    if (v !== bV) c = d;
  }
  return c;
};

export default merge;
