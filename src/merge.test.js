import { strict as assert } from 'assert';

import merge from './merge.js';

const isEqual = (a, b) => merge(a, b) === b;

let seed = 0;
const getRandom = () => {
  const x = Math.sin(++seed) * 10000;
  return x - Math.floor(x);
};

const createRandomObj = (depth = 0) => {
  const random = getRandom();
  if (depth === 3) {
    return random < 0.2
      ? null
      : random < 0.4
      ? 0
      : random < 0.6
      ? true
      : random < 0.8
      ? 'str'
      : undefined;
  }

  const values = Array(10)
    .fill()
    .map(() => createRandomObj(depth + 1));
  return random < 0.5 ? values : Object.fromEntries(Object.entries(values));
};

export default {
  basic: () => {
    const data = {
      a: { b: 1 },
      c: { d: 1 },
      e: [{ a: 1 }, { b: 2 }]
    };

    assert.equal(merge({ ...data, e: [...data.e] }, data), data);

    let data2 = { a: { b: 1 } };
    let merged = merge(data2, data);
    assert.deepEqual(merged, data2);
    assert.equal(merged.a, data.a);

    data2 = { e: [{ a: 1 }] };
    merged = merge(data2, data);
    assert.deepEqual(merged, data2);
    assert.equal(merged.e[0], data.e[0]);
  },
  undefined: () => {
    assert.equal(isEqual(undefined, undefined), true);
    assert.equal(isEqual(undefined, null), false);
    assert.equal(isEqual(null, undefined), false);
    assert.equal(isEqual(undefined, {}), false);
  },

  null: () => {
    assert.equal(isEqual(null, null), true);
    assert.equal(isEqual(null, 0), false);
    assert.equal(isEqual(null, ''), false);
    assert.equal(isEqual(undefined, {}), false);
  },

  boolean: () => {
    assert.equal(isEqual(true, true), true);
    assert.equal(isEqual(false, false), true);
    assert.equal(isEqual(true, false), false);
    assert.equal(isEqual(true, {}), false);
    assert.equal(isEqual(false, null), false);
  },

  string: () => {
    assert.equal(isEqual('a', 'a'), true);
    assert.equal(isEqual('1', 1), false);
    assert.equal(isEqual(1, '1'), false);
    assert.equal(isEqual('[object Object]', {}), false);
  },

  number: () => {
    assert.equal(isEqual(1, 1), true);
    assert.equal(isEqual(1, 2), false);
    assert.equal(isEqual(1, '1'), false);
  },

  array: () => {
    assert.equal(isEqual([], []), true);
    assert.equal(isEqual([[]], [[]]), true);
    assert.equal(
      isEqual(
        [1, { two: 2, dos: 2 }, ['three']],
        [1, { dos: 2, two: 2 }, ['three']]
      ),
      true
    );
    assert.equal(isEqual([], [1]), false);
    assert.equal(isEqual([1], [1, 2]), false);
    assert.equal(isEqual([], {}), false);
  },

  obj: () => {
    assert.equal(isEqual({}, {}), true);
    assert.equal(isEqual({ a: 1 }, { a: 1 }), true);
    assert.equal(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
    assert.equal(isEqual({ a: 1 }, { b: 1 }), false);
    assert.equal(isEqual({ a: 1, b: 1 }, { b: 1 }), false);
    assert.equal(isEqual({ a: 1 }, { a: 1, b: 1 }), false);
    assert.equal(isEqual({}, []), false);
  },

  'bench #times=10': () => merge(createRandomObj(), createRandomObj())
};
