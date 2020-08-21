import { strict as assert } from 'assert';

import cacheExecute from './cache-execute.js';

export default {
  missing: () => {
    assert.deepEqual(
      cacheExecute({
        cache: {},
        query: { dne: {} }
      }),
      undefined
    );
  },
  simple: () => {
    assert.deepEqual(
      cacheExecute({
        cache: { _root: { _type: null, one: 1 } },
        query: { one: {} }
      }),
      { one: 1 }
    );
  },
  renamed: () => {
    assert.deepEqual(
      cacheExecute({
        cache: { _root: { _type: null, one: 1 } },
        query: { uno: { _field: 'one' } }
      }),
      { uno: 1 }
    );
  },
  args: () => {
    assert.deepEqual(
      cacheExecute({
        cache: { _root: { _type: null, 'sum({"a":1,"b":2})': 3 } },
        query: { sum: { _args: { b: 2, a: 1 } } }
      }),
      { sum: 3 }
    );
  },
  oneOf: () => {
    assert.deepEqual(
      cacheExecute({
        cache: {
          _root: {
            _type: null,
            oneOfs: [
              { _type: '_ref', key: 'Foo:1' },
              { _type: '_ref', key: 'Bar:2' }
            ]
          },
          'Foo:1': { _type: 'Foo', shared: 'a', id: 1, name: 'John' },
          'Bar:2': { _type: 'Bar', shared: 'b', id: 2, color: 'blue' }
        },
        query: {
          oneOfs: {
            shared: {},
            _on_Foo: { id: {}, name: {} },
            _on_Bar: { id: {}, color: {} }
          }
        }
      }),
      {
        oneOfs: [
          { shared: 'a', id: 1, name: 'John' },
          { shared: 'b', id: 2, color: 'blue' }
        ]
      }
    );
  },
  key: () => {
    assert.deepEqual(
      cacheExecute({
        cache: {
          _root: {
            _type: null,
            oneOfs: [
              { _type: '_ref', key: 'Foo:1' },
              { _type: '_ref', key: 'Bar:2' }
            ]
          },
          'Foo:1': { _type: 'Foo', shared: 'a', id: 1, name: 'John' },
          'Bar:2': { _type: 'Bar', shared: 'b', id: 2, color: 'blue' }
        },
        query: { id: {}, name: {} },
        key: 'Foo:1'
      }),
      { id: 1, name: 'John' }
    );
  },
  refs: () => {
    assert.deepEqual(
      cacheExecute({
        cache: {
          _root: { _type: '_ref', key: 'Root' },
          Root: { _type: null, foo: { _type: '_ref', key: 'Foo:1' } },
          'Foo:1': {
            _type: 'Foo',
            id: 1,
            name: 'foo',
            root: { _type: '_ref', key: 'Root' }
          }
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
