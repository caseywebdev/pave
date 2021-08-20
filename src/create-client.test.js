import { strict as assert } from 'assert';

import createClient from './create-client.js';

export default {
  simple: () => {
    const client = createClient();
    const events = [];
    const onChange = data => events.push(data);
    client.watch({ onChange });
    client.watch({ query: { foo: {} }, onChange });
    client.watch({
      query: { dne: {} },
      onChange: () => {
        throw new Error('Should not have been called');
      }
    });
    client.update({
      data: { _type: null, foo: 123 },
      query: { _type: {}, foo: {} }
    });
    client.update({
      data: { _type: null, foo: 123 },
      query: { _type: {}, foo: {} }
    });
    assert.deepEqual(events, [
      { _root: { _type: null, foo: 123 } },
      { _type: null, foo: 123 }
    ]);

    const base = { _type: null, bar: { _type: null, baz: {}, bang: {} } };
    client.update({
      data: { _type: null, bar: { _type: null, baz: {}, bang: {} } },
      query: { _type: {}, bar: { _type: null, baz: {}, bang: {} } }
    });
    const { data } = client.watch({
      data: base,
      query: { bar: { baz: {}, bang: {} } },
      onChange: data => {
        assert.equal(data.bar.baz, 1);
        assert.equal(base.bar.bang, data.bar.bang);
      }
    });
    assert.equal(base, data);
    client.update({
      data: { _type: null, bar: { _type: null, baz: {}, bang: {} } },
      query: { _type: {}, bar: { _type: {}, baz: 1 } }
    });
  },

  'cancel watching': () => {
    const client = createClient();
    const events = [];
    const onChange = data => events.push(data);
    const { unwatch } = client.watch({ onChange });
    client.update({ data: { foo: 123 }, query: { foo: {} } });
    unwatch();
    client.update({ data: { foo: 456 }, query: { foo: {} } });
    assert.deepEqual(events, [{ _root: { foo: 123 } }]);
  },

  'ref changes': () => {
    const client = createClient({
      getKey: ({ _type }) => _type
    });
    const events = [];
    const onChange = data => events.push(data);
    client.watch({ query: { foo: { id: {} } }, onChange });
    client.watch({
      query: { _key: { _args: { arg: 1 }, id: {}, name: {} } },
      onChange
    });
    client.update({
      data: {
        _type: 'Root',
        _key: { _type: 'Foo:1' },
        foo: { _type: 'Foo:1', id: 1, name: 'foo' }
      },
      query: {
        _type: {},
        _key: { _args: { arg: 1 }, _type: {} },
        foo: { _type: {}, id: {}, name: {} }
      }
    });
    client.cacheUpdate({ data: { 'Foo:1': { _type: 'Foo:1', id: 2 } } });
    client.cacheUpdate({ data: { 'Foo:1': { _type: 'Foo:1', name: 'FOO' } } });
    assert.deepEqual(events, [
      { _type: 'Root', foo: { _type: 'Foo:1', id: 1 } },
      { _type: 'Root', _key: { _type: 'Foo:1', id: 1, name: 'foo' } },
      { _type: 'Root', foo: { _type: 'Foo:1', id: 2 } },
      { _type: 'Root', _key: { _type: 'Foo:1', id: 2, name: 'foo' } },
      { _type: 'Root', _key: { _type: 'Foo:1', id: 2, name: 'FOO' } }
    ]);
  },

  'arg ref changes': () => {
    const client = createClient({
      getKey: ({ _type, id }) =>
        _type === 'Root' ? 'Root' : _type && id ? `${_type}:${id}` : null
    });
    const events = [];
    const onChange = data => events.push(data);
    client.watch({
      query: { foo: { _args: { id: 1 }, _type: {}, id: {}, name: {} } },
      onChange
    });
    client.update({
      data: {
        _type: 'Root',
        foo: { _type: 'Foo', id: 1, name: 'foo' }
      },
      query: {
        _type: {},
        id: {},
        foo: {
          _args: { id: 1 },
          _type: {},
          id: {},
          name: { _type: {}, id: {} }
        }
      }
    });
    assert.deepEqual(events, [
      { _type: 'Root', foo: { _type: 'Foo', id: 1, name: 'foo' } }
    ]);
  }
};
