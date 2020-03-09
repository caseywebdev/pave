import { strict as assert } from 'assert';

import cacheExecute from './cache-execute.js';

export default {
  missing: () => {
    assert.deepEqual(
      cacheExecute({
        cache: { _root: {} },
        query: { dne: {} }
      }),
      undefined
    );
  },
  simple: () => {
    assert.deepEqual(
      cacheExecute({
        cache: { _root: { one: 1 } },
        query: { one: {} }
      }),
      { one: 1 }
    );
  },
  renamed: () => {
    assert.deepEqual(
      cacheExecute({
        cache: { _root: { one: 1 } },
        query: { uno: { _from: 'one' } }
      }),
      { uno: 1 }
    );
  },
  args: () => {
    assert.deepEqual(
      cacheExecute({
        cache: { _root: { 'sum({"a":1,"b":2})': 3 } },
        query: { sum: { _args: { b: 2, a: 1 } } }
      }),
      { sum: 3 }
    );
  },
  refs: () => {
    assert.deepEqual(
      cacheExecute({
        cache: {
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
        foo: {
          id: 1,
          name: 'foo',
          root: { foo: { id: 1 } }
        }
      }
    );
  },
  literal: () => {
    assert.deepEqual(
      cacheExecute({
        cache: {
          _root: { literal: { _literal: 'anything', _ref: 'nofollow' } }
        },
        query: { literal: { ignored: {} } }
      }),
      {
        literal: { _literal: 'anything', _ref: 'nofollow' }
      }
    );
  }
};