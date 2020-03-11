import isEqual from './is-equal.js';

const mergeQueries = (a, b) => {
  if (!a) return b;
  if (!b) return a;

  if (!isEqual(a._args, b._args) || !isEqual(a._field, b._field)) return b;

  const c = { ...a };

  for (const key in b) {
    if (key !== '_args' && key !== '_field') {
      c[key] = mergeQueries(a[key], b[key]);
    }
  }

  return c;
};

export default mergeQueries;
