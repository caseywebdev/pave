import { strict as assert } from 'assert';

import normalizeKey from './normalize-key.js';

export default {
  'without $': () =>
    assert.equal(normalizeKey({ alias: 'foo', query: {} }), 'foo'),

  'with _': () =>
    assert.equal(normalizeKey({ alias: 'bar', query: { _: 'foo' } }), 'foo'),

  'with $': () =>
    assert.equal(
      normalizeKey({ alias: 'foo', query: { $: { b: 2, a: 1 } } }),
      'foo({"a":1,"b":2})'
    ),

  'with $ and _': () =>
    assert.equal(
      normalizeKey({
        alias: 'bar',
        query: { _: 'foo', $: { b: 2, a: 1 } }
      }),
      'foo({"a":1,"b":2})'
    ),

  'with same $ reversed': () =>
    assert.equal(
      normalizeKey({ alias: 'foo', query: { $: { b: 2, a: 1 } } }),
      normalizeKey({ alias: 'foo', query: { $: { a: 1, b: 2 } } })
    )
};
