import { strict as assert } from 'assert';

import merge from './merge.js';

export default () => {
  const data = { _root: { foo: 1, bar: { a: 1 } } };

  assert.equal(merge(data, { _root: {} }), data);
  assert.equal(merge(data, { _root: {} }), data);
  assert.equal(merge(data, { _root: { foo: 1 } }), data);
  assert.equal(merge(data, { _root: { foo: 1, bar: { a: 1 } } }), data);

  let updated = merge(data, { _root: { foo: 2 } });
  assert.notEqual(updated, data);
  assert.equal(updated._root.foo, 2);
  assert.equal(updated._root.bar, data._root.bar);

  updated = merge(data, { _root: { bar: { b: 1 } } });
  assert.notEqual(updated, data);
  assert.deepEqual(updated._root.bar, { b: 1 });
  assert.equal(updated._root.foo, data._root.foo);

  updated = merge(data, { _root: { baz: 'new' } });
  assert.notEqual(updated, data);
  assert.deepEqual(updated._root.baz, 'new');
  assert.equal(updated._root.foo, data._root.foo);
  assert.equal(updated._root.bar, data._root.bar);
};
