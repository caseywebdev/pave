import { strict as assert } from 'assert';

import validateValue from './validate-value.js';

export default () => {
  assert.deepEqual(
    validateValue({
      type: [
        {},
        [{}, { optional: {} }, { object: { key: {} } }, { nullable: {} }]
      ],
      value: [1, [2, undefined, { key: 1 }]]
    }),
    [1, [2, undefined, { key: 1 }, null]]
  );

  assert.deepEqual(
    validateValue({
      type: { object: { undef: { optional: {} } } },
      value: {}
    }),
    {}
  );
};
