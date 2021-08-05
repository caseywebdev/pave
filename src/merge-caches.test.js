import { strict as assert } from 'assert';

import mergeCaches from './merge-caches.js';

export default () => {
  const data = {
    _root: {
      _type: null,
      foo: 1,
      bar: { a: 1 },
      baz: { _type: null, a: 1 },
      buz: [{ a: 1 }, { a: 2 }, { a: 3 }]
    }
  };

  assert.equal(mergeCaches(data, { _root: { _type: null } }), data);
  assert.equal(mergeCaches(data, { _root: { _type: null } }), data);
  assert.equal(mergeCaches(data, { _root: { _type: null, foo: 1 } }), data);
  assert.equal(
    mergeCaches(data, { _root: { _type: null, foo: 1, bar: { a: 1 } } }),
    data
  );

  let updated = mergeCaches(data, { _root: { _type: null, foo: 2 } });
  assert.notEqual(updated, data);
  assert.equal(updated._root.foo, 2);
  assert.equal(updated._root.bar, data._root.bar);

  updated = mergeCaches(data, { _root: { _type: null, bar: { b: 1 } } });
  assert.notEqual(updated, data);
  assert.deepEqual(updated._root.bar, { b: 1 });
  assert.equal(updated._root.foo, data._root.foo);

  updated = mergeCaches(data, { _root: { _type: null, baz: 'new' } });
  assert.notEqual(updated, data);
  assert.deepEqual(updated._root.baz, 'new');
  assert.equal(updated._root.foo, data._root.foo);
  assert.equal(updated._root.bar, data._root.bar);

  updated = mergeCaches(data, {
    _root: { _type: null, baz: { _type: null, b: 2 } }
  });
  assert.notEqual(updated, data);
  assert.deepEqual(updated._root.baz, { _type: null, a: 1, b: 2 });
  assert.equal(updated._root.foo, data._root.foo);
  assert.equal(updated._root.bar, data._root.bar);

  updated = mergeCaches(data, {
    _root: { _type: null, buz: [{ a: 1 }, { a: 2 }] }
  });
  assert.notEqual(updated, data);
  assert.deepEqual(updated._root.buz, [{ a: 1 }, { a: 2 }]);
  assert.equal(updated._root.buz[0], data._root.buz[0]);
  assert.equal(updated._root.buz[1], data._root.buz[1]);
};
