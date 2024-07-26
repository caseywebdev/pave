import { strict as assert } from 'assert';

import validateSchema from './validate-schema.js';

export default () => {
  assert.throws(
    () => validateSchema({
      schema: { emptyOneOf: { oneOf: {}, resolveType: () => {} } }
    })
  );
};
