import { strict as assert } from 'assert';

import mergeQueries from './merge-queries.js';

export default {
  simple: () => {
    assert.deepEqual(mergeQueries({ foo: {} }, { bar: {} }), {
      foo: {},
      bar: {}
    });

    assert.deepEqual(
      mergeQueries({ foo: { one: {} } }, { foo: { two: {} }, bar: {} }),
      {
        foo: { one: {}, two: {} },
        bar: {}
      }
    );

    assert.deepEqual(
      mergeQueries(
        { foo: { _args: { a: 1 }, one: {} } },
        { foo: { _args: { a: 1 }, two: {} }, bar: {} }
      ),
      {
        foo: { _args: { a: 1 }, one: {}, two: {} },
        bar: {}
      }
    );
  },

  'b wins _args': () => {
    assert.deepEqual(
      mergeQueries(
        { foo: { _args: { a: 1 }, one: {} } },
        { foo: { _args: { a: 2 }, two: {} }, bar: {} }
      ),
      {
        foo: { _args: { a: 2 }, two: {} },
        bar: {}
      }
    );
  },

  'b wins _field': () => {
    assert.deepEqual(
      mergeQueries(
        { foo: { _field: 'buz', one: {} } },
        { foo: { _field: 'baz', two: {} }, bar: {} }
      ),
      {
        foo: { _field: 'baz', two: {} },
        bar: {}
      }
    );
  }
};
