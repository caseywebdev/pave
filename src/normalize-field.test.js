import { strict as assert } from 'assert';

import normalizeField from './normalize-field.js';

export default {
  'without args': () =>
    assert.equal(normalizeField({ alias: 'foo', query: {} }), 'foo'),

  'with _field': () =>
    assert.equal(
      normalizeField({ alias: 'bar', query: { _field: 'foo' } }),
      'foo'
    ),

  'with args': () =>
    assert.equal(
      normalizeField({ alias: 'foo', query: { _args: { b: 2, a: 1 } } }),
      'foo({"a":1,"b":2})'
    ),

  'with args and _field': () =>
    assert.equal(
      normalizeField({
        alias: 'bar',
        query: { _field: 'foo', _args: { b: 2, a: 1 } }
      }),
      'foo({"a":1,"b":2})'
    ),

  'with same args reversed': () =>
    assert.equal(
      normalizeField({ alias: 'foo', query: { _args: { b: 2, a: 1 } } }),
      normalizeField({ alias: 'foo', query: { _args: { a: 1, b: 2 } } })
    )
};
