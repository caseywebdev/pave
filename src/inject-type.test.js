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
        name: {},
        b: {}
      }
    }),
    {
      _type: {},
      _args: { a: 1 },
      _field: 'foo',
      id: { _type: {} },
      a: {
        _type: { _field: 'not overridden' },
        name: { _type: {} },
        b: { _type: {} }
      }
    }
  );
};
