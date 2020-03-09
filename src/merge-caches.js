import isEqual from './is-equal.js';

export default (a, b) => {
  let c = a;

  for (const k1 in b) {
    for (const k2 in b[k1]) {
      if (isEqual(b[k1][k2], c[k1] && c[k1][k2])) continue;

      if (c === a) c = { ...a };
      if (c[k1] === a[k1]) c[k1] = { ...a[k1] };
      c[k1][k2] = b[k1][k2];
    }
  }

  return c;
};
