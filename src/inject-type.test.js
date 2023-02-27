import { strict as assert } from 'assert';

import injectType from './inject-type.js';

export default () => {
  assert.deepEqual(
    injectType({
      $: { a: 1 },
      _: 'foo',
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
      $: { a: 1 },
      _: 'foo',
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
