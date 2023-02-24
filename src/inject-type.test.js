import { strict as assert } from 'assert';

import injectType from './inject-type.js';

export default () => {
  assert.deepEqual(
    injectType({
      _arg: { a: 1 },
      _key: 'foo',
      id: {},
      a: {
        _type: { _key: 'not overridden' },
        name: { _arg: { formal: true } },
        b: {},
        c: {
          d: {},
          e: {}
        }
      }
    }),
    {
      _type: {},
      _arg: { a: 1 },
      _key: 'foo',
      id: {},
      a: {
        _type: { _key: 'not overridden' },
        name: { _arg: { formal: true } },
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
