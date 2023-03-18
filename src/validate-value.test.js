import { strict as assert } from 'assert';

import validateValue from './validate-value.js';

export default () => {
  assert.deepEqual(
    validateValue({
      type: [
        {},
        [
          {},
          { optional: {} },
          {
            object: { key: { constant: null } },
            defaultType: { optional: {} }
          },
          { nullable: {} },
          { constant: 123 }
        ]
      ],
      value: [
        1,
        [2, undefined, { key: null, foo: 123, bar: undefined }, null, 123]
      ]
    }),
    [1, [2, undefined, { key: null, foo: 123 }, null, 123]]
  );

  assert.deepEqual(
    validateValue({
      type: { object: { undef: { optional: {} } } },
      value: {}
    }),
    {}
  );
};
