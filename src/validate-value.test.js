import { strict as assert } from 'assert';

import PaveError from './pave-error.js';
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

  assert.throws(
    () =>
      validateValue({
        type: { validate: ({ value }) => value || null },
        value: ''
      }),
    new PaveError('A non-null value is required at the query root')
  );
};
