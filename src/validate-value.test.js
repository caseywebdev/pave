import { strict as assert } from 'node:assert';

import { PaveError } from '#src/pave-error.js';
import { validateValue } from '#src/validate-value.js';

export default () => {
  assert.deepEqual(
    validateValue({
      schema: {},
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
      schema: {},
      type: { object: { undef: { optional: {} } } },
      value: {}
    }),
    {}
  );

  assert.throws(
    () =>
      validateValue({
        schema: {},
        type: { validate: ({ value }) => value || null },
        value: ''
      }),
    new PaveError('A non-null value is required at the query root')
  );
};
