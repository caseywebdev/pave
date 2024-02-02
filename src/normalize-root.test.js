import assert from 'node:assert/strict';

import normalizeRoot from './normalize-root.js';

export default {
  'without $': () => assert.equal(normalizeRoot({ query: {} }), '_root'),

  'with _': () => assert.equal(normalizeRoot({ query: { _: 'foo' } }), '_root'),

  'with $': () =>
    assert.equal(
      normalizeRoot({ query: { $: { b: 2, a: 1 } } }),
      '_root({"a":1,"b":2})'
    ),

  'with $ and _': () =>
    assert.equal(
      normalizeRoot({ query: { _: '_root', $: { b: 2, a: 1 } } }),
      '_root({"a":1,"b":2})'
    ),

  'with same $ reversed': () =>
    assert.equal(
      normalizeRoot({ query: { $: { b: 2, a: 1 } } }),
      normalizeRoot({ query: { $: { a: 1, b: 2 } } })
    )
};
