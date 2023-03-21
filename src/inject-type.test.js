import { strict as assert } from 'assert';

import injectType from './inject-type.js';

export default () => {
  assert.deepEqual(
    injectType({
      _args: { a: 1 },
      _field: 'foo',
      id: {},
      a: {
        _type: { _field: 'not overridden' },
        name: { _args: { formal: true } },
        b: {},
        c: {
          d: {},
          e: {}
        }
      }
    }),
    {
      _type: {},
      _args: { a: 1 },
      _field: 'foo',
      id: {},
      a: {
        _type: { _field: 'not overridden' },
        name: { _args: { formal: true } },
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
