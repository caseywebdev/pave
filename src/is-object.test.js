import { strict as assert } from 'node:assert';

import { isObject } from '#src/is-object.js';

export default {
  withKeys: () => assert.deepEqual(isObject({ a: 1 }), true),

  'without keys': () => assert.deepEqual(isObject({}), true),

  null: () => assert.deepEqual(isObject(null), false),

  undefined: () => assert.deepEqual(isObject(undefined), false),

  array: () => assert.deepEqual(isObject([]), true),

  boolean: () => assert.deepEqual(isObject(true), false),

  number: () => assert.deepEqual(isObject(0), false),

  string: () => assert.deepEqual(isObject('str'), false),

  function: () =>
    assert.deepEqual(
      isObject(() => {}),
      false
    )
};
