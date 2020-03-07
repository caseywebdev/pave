import { strict as assert } from 'assert';

import cacheExecute from './cache-execute.js';

export default {
  missing: () => {
    assert.deepEqual(
      cacheExecute({
        data: { _root: {} },
        query: { dne: {} }
      }),
      { isPartial: true, data: { dne: null } }
    );
  },
  simple: () => {
    assert.deepEqual(
      cacheExecute({
        data: { _root: { one: 1 } },
        query: { one: {} }
      }),
      { isPartial: false, data: { one: 1 } }
    );
  },
  renamed: () => {
    assert.deepEqual(
      cacheExecute({
        data: { _root: { one: 1 } },
        query: { uno: { _from: 'one' } }
      }),
      { isPartial: false, data: { uno: 1 } }
    );
  },
  args: () => {
    assert.deepEqual(
      cacheExecute({
        data: { _root: { 'sum({"a":1,"b":2})': 3 } },
        query: { sum: { _args: { b: 2, a: 1 } } }
      }),
      { isPartial: false, data: { sum: 3 } }
    );
  },
  refs: () => {
    assert.deepEqual(
      cacheExecute({
        data: {
          _root: { _ref: 'Root' },
          Root: { foo: { _ref: 'Foo:1' } },
          'Foo:1': { _type: 'Foo', id: 1, name: 'foo', root: { _ref: 'Root' } }
        },
        query: {
          foo: {
            id: {},
            name: {},
            root: { foo: { id: {} } }
          }
        }
      }),
      {
        isPartial: false,
        data: {
          foo: {
            id: 1,
            name: 'foo',
            root: { foo: { id: 1 } }
          }
        }
      }
    );
  },
  literal: () => {
    assert.deepEqual(
      cacheExecute({
        data: {
          _root: { literal: { _literal: 'anything', _ref: 'nofollow' } }
        },
        query: { literal: { ignored: {} } }
      }),
      {
        isPartial: false,
        data: { literal: { _literal: 'anything', _ref: 'nofollow' } }
      }
    );
  }
};
