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
        query: { uno: { _: 'one' } }
      }),
      { uno: 1 }
    );
  },
  $: () => {
    assert.deepEqual(
      cacheExecute({
        cache: { _root: { _type: null, 'sum({"a":1,"b":2})': 3 } },
        query: { sum: { $: { b: 2, a: 1 } } }
      }),
      { sum: 3 }
    );
  },
  'root $': () => {
    assert.deepEqual(
      cacheExecute({
        cache: { '_root({"foo":"bar"})': { key: 'value' } },
        query: { $: { foo: 'bar' }, key: {} }
      }),
      { key: 'value' }
    );
    assert.deepEqual(
      cacheExecute({
        cache: { _root: { key: 'value' } },
        query: { $: { foo: 'bar' }, key: {} }
      }),
      undefined
    );
  },
  oneOf: () => {
    assert.deepEqual(
      cacheExecute({
        cache: {
          _root: {
            _type: null,
            oneOfs: [{ _type: { ref: 'Foo:1' } }, { _type: { ref: 'Bar:2' } }]
          },
          'Foo:1': { _type: 'Foo', shared: 'a', id: 1, name: 'John' },
          'Bar:2': { _type: 'Bar', shared: 'b', id: 2, color: 'blue' }
        },
        query: {
          oneOfs: {
            _on_Foo: { id: {}, name: {}, shared: {} },
            _on_Bar: { id: {}, color: {}, shared: {} }
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
            oneOfs: [{ _type: { ref: 'Foo:1' } }, { _type: { ref: 'Bar:2' } }]
          },
          'Foo:1': { _type: 'Foo', shared: 'a', id: 1, name: 'John' },
          'Bar:2': { _type: 'Bar', shared: 'b', id: 2, color: 'blue' }
        },
        query: { id: {}, name: {} },
        ref: 'Foo:1'
      }),
      { id: 1, name: 'John' }
    );
  },
  refs: () => {
    assert.deepEqual(
      cacheExecute({
        cache: {
          _root: { _type: { ref: 'Root' } },
          Root: { _type: null, foo: { _type: { ref: 'Foo:1' } } },
          'Foo:1': {
            _type: 'Foo',
            id: 1,
            name: 'foo',
            root: { _type: { ref: 'Root' } }
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
