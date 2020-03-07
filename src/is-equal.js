import isArray from './is-array.js';
import isObject from './is-object.js';

const isEqual = (a, b) => {
  if (a === b) return true;

  if (!isObject(a) || !isObject(b)) return a === b;

  if (isArray(a)) {
    if (!isArray(b) || a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) if (!isEqual(a[i], b[i])) return false;

    return true;
  }

  if (isArray(b)) return false;

  if (Object.keys(a).length !== Object.keys(b).length) return false;

  for (const key in a) if (!isEqual(a[key], b[key])) return false;

  return true;
};

export default isEqual;
