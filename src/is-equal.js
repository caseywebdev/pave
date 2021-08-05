import isArray from './is-array.js';
import isObject from './is-object.js';

const isEqual = (a, b) => {
  if (a === b) return true;

  if (!isObject(a) || !isObject(b)) return false;

  if (isArray(a)) {
    return (
      isArray(b) && a.length === b.length && a.every((v, i) => isEqual(v, b[i]))
    );
  }

  if (isArray(b)) return false;

  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every(k => isEqual(a[k], b[k]))
  );
};

export default isEqual;
