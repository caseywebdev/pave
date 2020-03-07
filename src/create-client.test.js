import { strict as assert } from 'assert';

import createClient from './create-client.js';

export default {
  simple: () => {
    const client = createClient();
    const events = [];
    const onChange = data => events.push(data);
    client.watch({ onChange });
    client.watch({ query: {}, onChange });
    client.watch({ query: { foo: {} }, onChange });
    client.watch({ query: { dne: {} }, onChange: () => assert.fail() });
    client.update({ data: { foo: 123 }, query: { foo: {} } });
    client.update({ data: { foo: 123 }, query: { foo: {} } });
    assert.deepEqual(events, [{ _root: { foo: 123 } }, {}, { foo: 123 }]);
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
      key: 'Foo:1',
      query: { id: {}, name: {} },
      onChange
    });
    client.update({
      data: { foo: { $key: 'Foo:1', id: 1, name: 'foo' } },
      query: { foo: { id: {}, name: {} } }
    });
    client.update({
      data: { $key: 'Foo:1', id: 2 },
      key: 'Foo:1',
      query: { id: {} }
    });
    client.update({
      data: { $key: 'Foo:1', name: 'FOO' },
      key: 'Foo:1',
      query: { name: {} }
    });
    assert.deepEqual(events, [
      { $key: null, foo: { $key: 'Foo:1', id: 1 } },
      { $key: 'Foo:1', id: 1, name: 'foo' },
      { $key: null, foo: { $key: 'Foo:1', id: 2 } },
      { $key: 'Foo:1', id: 2, name: 'foo' },
      { $key: 'Foo:1', id: 2, name: 'FOO' }
    ]);
  }
};
