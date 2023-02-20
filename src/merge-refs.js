import isObject from './is-object.js';

const { isArray } = Array;

const merge = (a, b) => {
  if (a === b || !isObject(a) || !isObject(b)) return a;

  if (isArray(a)) {
    if (!isArray(b)) return a;

    const l = a.length;
    const d = new Array(l);
    let c = l === b.length ? b : d;
    for (let i = 0; i < l; ++i) if ((d[i] = merge(a[i], b[i])) !== b[i]) c = d;
    return c;
  }

  if (isArray(b)) return a;

  const d = {};
  const keys = Object.keys(a);
  const l = keys.length;
  let c = l === Object.keys(b).length ? b : d;
  for (let i = 0; i < l; ++i) {
    const k = keys[i];
    if ((d[k] = merge(a[k], b[k])) !== b[k]) c = d;
  }
  return c;
};

export default merge;
