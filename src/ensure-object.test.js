import { strict as assert } from 'assert';

import ensureObject from './ensure-object.js';

export default {
  withKeys: () => assert.deepEqual(ensureObject({ a: 1 }), { a: 1 }),

  'without keys': () => assert.deepEqual(ensureObject({}), {}),

  null: () => assert.deepEqual(ensureObject(null), {}),

  undefined: () => assert.deepEqual(ensureObject(undefined), {}),

  array: () => assert.deepEqual(ensureObject([]), {}),

  boolean: () => assert.deepEqual(ensureObject(true), {}),

  number: () => assert.deepEqual(ensureObject(0), {}),

  string: () => assert.deepEqual(ensureObject('str'), {}),

  function: () =>
    assert.deepEqual(
      ensureObject(() => {}),
      {}
    )
};
