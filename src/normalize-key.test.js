import { strict as assert } from 'assert';

import normalizeKey from './normalize-key.js';

export default {
  'without _args': () =>
    assert.equal(normalizeKey({ alias: 'foo', query: {} }), 'foo'),

  'with _key': () =>
    assert.equal(normalizeKey({ alias: 'bar', query: { _key: 'foo' } }), 'foo'),

  'with _args': () =>
    assert.equal(
      normalizeKey({ alias: 'foo', query: { _args: { b: 2, a: 1 } } }),
      'foo({"a":1,"b":2})'
    ),

  'with _args and _key': () =>
    assert.equal(
      normalizeKey({
        alias: 'bar',
        query: { _key: 'foo', _args: { b: 2, a: 1 } }
      }),
      'foo({"a":1,"b":2})'
    ),

  'with same _args reversed': () =>
    assert.equal(
      normalizeKey({ alias: 'foo', query: { _args: { b: 2, a: 1 } } }),
      normalizeKey({ alias: 'foo', query: { _args: { a: 1, b: 2 } } })
    )
};
