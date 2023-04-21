import { strict as assert } from 'assert';

import injectType from './inject-type.js';

export default () => {
  assert.deepEqual(
    injectType({
      _: 'foo',
      $: { a: 1 },
      id: {},
      a: {
        _type: { _: 'not overridden' },
        name: { $: { formal: true } },
        b: {},
        c: {
          d: {},
          e: {}
        }
      }
    }),
    {
      _type: {},
      _: 'foo',
      $: { a: 1 },
      id: {},
      a: {
        _type: { _: 'not overridden' },
        name: { $: { formal: true } },
        b: {},
        c: {
          _type: {},
          d: {},
          e: {}
        }
      }
    }
  );
};
