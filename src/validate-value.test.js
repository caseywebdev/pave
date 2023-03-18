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
          { object: { key: [] }, defaultType: { optional: {} } },
          { nullable: {} }
        ]
      ],
      value: [1, [2, undefined, { key: [], foo: 123, bar: undefined }]]
    }),
    [1, [2, undefined, { key: [], foo: 123 }, null]]
  );

  assert.deepEqual(
    validateValue({
      type: { object: { undef: { optional: {} } } },
      value: {}
    }),
    {}
  );
};
