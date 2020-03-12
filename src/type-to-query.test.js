import { strict as assert } from 'assert';

import typeToQuery from './type-to-query.js';

export default () => {
  const schema = {
    Root: {
      fields: {
        foos: { nonNull: { arrayOf: { nonNull: 'Foo' } } }
      }
    },
    Foo: {
      fields: {
        either: { oneOf: ['Foo', 'Bar'] },
        bar: 'Bar'
      }
    },
    Bar: {
      fields: {
        isBar: {},
        root: 'Root'
      }
    }
  };

  assert.deepEqual(typeToQuery({ schema, type: 'Root' }), {
    foos: {
      bar: {
        isBar: {},
        root: {}
      },
      either: {
        _onFoo: {},
        _onBar: {
          isBar: {},
          root: {}
        }
      }
    }
  });
};
