/**
 * @param {string} a
 * @param {string} b
 */
export const levenshtein = (a, b) => {
  /** @type {[number[], number[]]} */
  let [v0, v1] = [new Array(b.length + 1), new Array(b.length + 1)];

  for (let i = 0; i <= b.length; ++i) v0[i] = i;

  for (let i = 0; i < a.length; ++i) {
    v1[0] = i + 1;
    const aV = a[i];
    for (let j = 0; j < b.length; ++j) {
      v1[j + 1] = Math.min(
        v0[j] + (aV === b[j] ? 0 : 1),
        v0[j + 1] + 1,
        v1[j] + 1
      );
    }
    [v0, v1] = [v1, v0];
  }

  return v0[b.length];
};
