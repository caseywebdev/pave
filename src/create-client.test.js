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
      onChange: () => assert.fail('Should not have been called')
    });
    client.update({ data: { foo: 123 }, query: { foo: {} } });
    client.update({ data: { foo: 123 }, query: { foo: {} } });
    assert.deepEqual(events, [{ _root: { foo: 123 } }, { foo: 123 }]);
  },

  'cancel watching': () => {
    const client = createClient();
    const events = [];
    const onChange = data => events.push(data);
    const cancel = client.watch({ onChange });
    client.update({ data: { foo: 123 }, query: { foo: {} } });
    cancel();
    client.update({ data: { foo: 456 }, query: { foo: {} } });
    assert.deepEqual(events, [{ _root: { foo: 123 } }]);
  },

  'ref changes': () => {
    const client = createClient({
      getKey: ({ $key }) => $key,
      injection: { $key: {} }
    });
    const events = [];
    const onChange = data => events.push(data);
    client.watch({ query: { foo: { id: {} } }, onChange });
    client.watch({
      query: { _key: { _args: { $key: 'Foo:1' }, id: {}, name: {} } },
      onChange
    });
    client.update({
      data: {
        _key: { $key: 'Foo:1' },
        foo: { $key: 'Foo:1', id: 1, name: 'foo' }
      },
      query: {
        _key: { _args: { $key: 'Foo:1' } },
        foo: { id: {}, name: {} }
      }
    });
    client.cacheUpdate({ data: { 'Foo:1': { id: 2 } } });
    client.cacheUpdate({ data: { 'Foo:1': { name: 'FOO' } } });
    assert.deepEqual(events, [
      { foo: { id: 1 } },
      { _key: { id: 1, name: 'foo' } },
      { foo: { id: 2 } },
      { _key: { id: 2, name: 'foo' } },
      { _key: { id: 2, name: 'FOO' } }
    ]);
  },

  'arg ref changes': () => {
    const client = createClient({
      getKey: ({ _type, id }) =>
        _type === 'Root' ? 'Root' : _type && id ? `${_type}:${id}` : null,
      injection: { _type: {}, id: {} }
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
        id: null,
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
    assert.deepEqual(events, [{ foo: { _type: 'Foo', id: 1, name: 'foo' } }]);
  }
};
