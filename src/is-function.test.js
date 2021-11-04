import { strict as assert } from 'assert';

import isFunction from './is-function.js';

export default {
  withKeys: () => assert.deepEqual(isFunction({ a: 1 }), false),

  'without keys': () => assert.deepEqual(isFunction({}), false),

  null: () => assert.deepEqual(isFunction(null), false),

  undefined: () => assert.deepEqual(isFunction(undefined), false),

  array: () => assert.deepEqual(isFunction([]), false),

  boolean: () => assert.deepEqual(isFunction(true), false),

  number: () => assert.deepEqual(isFunction(0), false),

  string: () => assert.deepEqual(isFunction('str'), false),

  function: () =>
    assert.deepEqual(
      isFunction(() => {}),
      true
    )
};
