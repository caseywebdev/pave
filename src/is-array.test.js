import { strict as assert } from 'assert';

import isArray from './is-array.js';

export default {
  withKeys: () => assert.deepEqual(isArray({ a: 1 }), false),

  'without keys': () => assert.deepEqual(isArray({}), false),

  null: () => assert.deepEqual(isArray(null), false),

  undefined: () => assert.deepEqual(isArray(undefined), false),

  array: () => assert.deepEqual(isArray([]), true),

  boolean: () => assert.deepEqual(isArray(true), false),

  number: () => assert.deepEqual(isArray(0), false),

  string: () => assert.deepEqual(isArray('str'), false),

  function: () =>
    assert.deepEqual(
      isArray(() => {}),
      false
    )
};
