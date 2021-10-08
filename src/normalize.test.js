import { strict as assert } from 'assert';

import injectType from './inject-type.js';
import normalize from './normalize.js';

export default {
  'from _root': () => {
    assert.deepEqual(
      normalize({
        getKey: ({ _type, id }) =>
          _type === 'Root' ? 'Root' : _type && id ? `${_type}:${id}` : null,
        data: {
          _type: 'Root',
          foo: {
            _type: 'Foo',
            id: 1,
            last: 'Last',
            nested: { _type: null, a: 1 },
            list: []
          },
          bar: {
            _type: 'Foo',
            id: 1,
            name: 'Mr Foo',
            nested: { _type: null, b: 2 },
            list: [
              {
                _type: 'Root',
                foo: { _type: 'Foo', id: 1, color: 'red' }
              },
              {
                _type: 'Root',
                foo: { _type: 'Foo', id: 1, color: 'blue' }
              }
            ]
          }
        },
        query: injectType({
          foo: {
            id: {},
            last: {},
            nested: { a: {} },
            list: { id: {}, foo: { id: {}, color: {} } }
          },
          bar: {
            _field: 'foo',
            _args: { id: 1 },
            id: {},
            name: {},
            nested: { b: {} },
            list: { id: {}, foo: { id: {}, color: {} } }
          }
        })
      }),
      {
        _root: { _type: '_ref', key: 'Root' },
        Root: {
          _type: 'Root',
          'foo({"id":1})': { _type: '_ref', key: 'Foo:1' },
          foo: { _type: '_ref', key: 'Foo:1' }
        },
        'Foo:1': {
          _type: 'Foo',
          id: 1,
          name: 'Mr Foo',
          last: 'Last',
          color: 'blue',
          nested: { _type: null, a: 1, b: 2 },
          list: [
            { _type: '_ref', key: 'Root' },
            { _type: '_ref', key: 'Root' }
          ]
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
        query: injectType({
          id: {},
          name: {},
          bar: { id: {}, name: {} }
        })
      }),
      {
        _root: { _type: '_ref', key: 'Foo:1' },
        'Foo:1': {
          _type: 'Foo',
          id: 1,
          name: 'foo',
          bar: { _type: '_ref', key: 'Bar:2' }
        },
        'Bar:2': {
          _type: 'Bar',
          id: 2,
          name: 'bar'
        }
      }
    );
  },

  'one of': () => {
    assert.deepEqual(
      normalize({
        getKey: ({ _type, id }) =>
          _type === 'Root' ? 'Root' : _type && id ? `${_type}:${id}` : null,
        data: {
          _type: null,
          oneOfs: [
            { _type: 'Foo', shared: 'a', id: 1, name: 'John' },
            { _type: 'Bar', shared: 'b', id: 2, color: 'blue' }
          ]
        },
        query: injectType({
          oneOfs: {
            shared: {},
            _on_Foo: { id: {}, name: {} },
            _on_Bar: { id: {}, color: {} }
          }
        })
      }),
      {
        _root: {
          _type: null,
          oneOfs: [
            { _type: '_ref', key: 'Foo:1' },
            { _type: '_ref', key: 'Bar:2' }
          ]
        },
        'Foo:1': { _type: 'Foo', shared: 'a', id: 1, name: 'John' },
        'Bar:2': { _type: 'Bar', shared: 'b', id: 2, color: 'blue' }
      }
    );
  },

  'with _args': () => {
    assert.deepEqual(
      normalize({
        data: { field: 'value' },
        query: { _args: { foo: 'bar' }, field: {} }
      }),
      { '_root({"foo":"bar"})': { field: 'value' } }
    );
  }
};
