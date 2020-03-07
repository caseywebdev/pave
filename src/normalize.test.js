import { strict as assert } from 'assert';

import inject from './inject.js';
import normalize from './normalize.js';

export default {
  'from _root': () => {
    assert.deepEqual(
      normalize({
        getKey: ({ _type, id }) =>
          _type === 'Root' ? 'Root' : _type && id ? `${_type}:${id}` : null,
        data: {
          _type: 'Root',
          id: null,
          foo: {
            _type: 'Foo',
            id: 1,
            last: 'Last',
            nested: { _type: null, id: null, a: 1, b: null },
            list: []
          },
          bar: {
            _type: 'Foo',
            id: 1,
            name: 'Mr Foo',
            nested: { _type: null, id: null, a: null, b: 2 },
            list: [
              {
                _type: 'Root',
                id: null,
                foo: { _type: 'Foo', id: 1, color: 'red' }
              },
              {
                _type: 'Root',
                id: null,
                foo: { _type: 'Foo', id: 1, color: 'blue' }
              }
            ]
          }
        },
        query: inject({
          injection: { _type: {}, id: {} },
          query: {
            foo: {
              last: {},
              nested: { a: {}, b: {} },
              list: { foo: { color: {} } }
            },
            bar: {
              _from: 'foo',
              _args: { id: 1 },
              id: {},
              name: {},
              nested: { a: {}, b: {} },
              list: { foo: { color: {} } }
            }
          }
        })
      }),
      {
        _root: { _ref: 'Root' },
        Root: {
          _type: 'Root',
          id: null,
          'foo({"id":1})': { _ref: 'Foo:1' },
          foo: { _ref: 'Foo:1' }
        },
        'Foo:1': {
          _type: 'Foo',
          id: 1,
          name: 'Mr Foo',
          last: 'Last',
          color: 'blue',
          nested: { _type: null, id: null, a: null, b: 2 },
          list: [{ _ref: 'Root' }, { _ref: 'Root' }]
        }
      }
    );
  },

  'from key': () => {
    assert.deepEqual(
      normalize({
        getKey: ({ _type, id }) =>
          _type === 'Root' ? 'Root' : _type && id ? `${_type}:${id}` : null,
        data: {
          _type: 'Foo',
          id: 1,
          name: 'foo',
          bar: {
            _type: 'Bar',
            id: 2,
            name: 'bar'
          }
        },
        key: 'Foo:1',
        query: inject({
          injection: { _type: {}, id: {} },
          query: {
            name: {},
            bar: { name: {} }
          }
        })
      }),
      {
        'Foo:1': {
          _type: 'Foo',
          id: 1,
          name: 'foo',
          bar: { _ref: 'Bar:2' }
        },
        'Bar:2': {
          _type: 'Bar',
          id: 2,
          name: 'bar'
        }
      }
    );
  }
};
