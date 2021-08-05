import { strict as assert } from 'assert';

import mergeRefs from './merge-refs.js';

const isEqual = (a, b) => mergeRefs(a, b) === b;

export default {
  basic: () => {
    const data = {
      a: { b: 1 },
      c: { d: 1 },
      e: [{ a: 1 }, { b: 2 }]
    };

    assert.equal(mergeRefs({ ...data, e: [...data.e] }, data), data);

    let data2 = { a: { b: 1 } };
    let merged = mergeRefs(data2, data);
    assert.deepEqual(merged, data2);
    assert.equal(merged.a, data.a);

    data2 = { e: [{ a: 1 }] };
    merged = mergeRefs(data2, data);
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

  object: () => {
    assert.equal(isEqual({}, {}), true);
    assert.equal(isEqual({ a: 1 }, { a: 1 }), true);
    assert.equal(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
    assert.equal(isEqual({ a: 1 }, { b: 1 }), false);
    assert.equal(isEqual({ a: 1, b: 1 }, { b: 1 }), false);
    assert.equal(isEqual({ a: 1 }, { a: 1, b: 1 }), false);
    assert.equal(isEqual({}, []), false);
  }
};
