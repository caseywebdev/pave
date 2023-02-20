import { strict as assert } from 'assert';

import normalizeKey from './normalize-key.js';

export default {
  'without arg': () =>
    assert.equal(normalizeKey({ alias: 'foo', query: {} }), 'foo'),

  'with _key': () =>
    assert.equal(normalizeKey({ alias: 'bar', query: { _key: 'foo' } }), 'foo'),

  'with arg': () =>
    assert.equal(
      normalizeKey({ alias: 'foo', query: { _arg: { b: 2, a: 1 } } }),
      'foo({"a":1,"b":2})'
    ),

  'with arg and _key': () =>
    assert.equal(
      normalizeKey({
        alias: 'bar',
        query: { _key: 'foo', _arg: { b: 2, a: 1 } }
      }),
      'foo({"a":1,"b":2})'
    ),

  'with same arg reversed': () =>
    assert.equal(
      normalizeKey({ alias: 'foo', query: { _arg: { b: 2, a: 1 } } }),
      normalizeKey({ alias: 'foo', query: { _arg: { a: 1, b: 2 } } })
    )
};
