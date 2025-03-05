import { strict as assert } from 'node:assert';

import { validateSchema } from '#src/validate-schema.js';

export default () => {
  assert.throws(
    () =>
      validateSchema({
        schema: { emptyOneOf: { oneOf: {}, resolveType: () => {} } }
      }),
    new Error('Expected "emptyOneOf"."oneOf" to define at least one type')
  );
};
