import { strict as assert } from 'assert';

import execute from './execute.js';
import validateQuery from './validate-query.js';

export default async () => {
  assert.deepEqual(
    await execute({
      schema: {
        Root: {
          defaultValue: {},
          fields: {
            a: { resolve: () => 1 }
          }
        }
      },
      type: 'Root',
      query: { a: {} }
    }),
    { a: 1 }
  );

  const schema = {
    Root: {
      name: 'Root',
      defaultValue: {},
      fields: {
        _type: { type: { nonNull: 'String' }, resolve: 'Root' },
        addition: 'Boolean',
        nullableString: {
          args: { string: 'String' },
          type: 'NullableString',
          resolve: ({ args: { string } }) => string
        },
        nonNullableNullableString: {
          args: { string: 'String' },
          type: { nonNull: 'NullableString' },
          resolve: ({ args: { string } }) => string
        },
        nullableStringArg: {
          args: { string: 'NullableString' },
          type: 'String',
          resolve: ({ args: { string } }) => string
        },
        selfLink: 'Root',
        selfLinkWithAddition: {
          type: 'Root',
          resolve: { addition: true }
        },
        things: {
          type: {
            nonNull: {
              arrayOf: {
                nonNull: {
                  oneOf: ['Bar', 'Foo'],
                  resolveType: ({ id }) => (id ? 'Foo' : 'Bar')
                }
              },
              minLength: 1,
              maxLength: 10
            }
          },
          resolve: () => () => () => () => () => [
            { id: 1 },
            { id: '2', name: 'foo' },
            { color: 'blue' }
          ]
        }
      }
    },
    Foo: {
      name: 'Foo',
      fields: {
        id: {
          type: {
            nonNull: {
              oneOf: ['Number', 'String'],
              resolveType: value =>
                typeof value === 'number' ? 'Number' : 'String'
            }
          }
        },
        subFoo: {
          type: 'Foo',
          resolve: async () => await { id: 123 }
        },
        name: {
          defaultValue: 'Default name',
          args: {
            separator: {
              nonNull: { type: 'String', typeArgs: { maxLength: 3 } }
            }
          },
          type: { nonNull: 'String' },
          resolve: ({ args: { separator }, value }) => () => () =>
            `${value}${separator}${value}`
        }
      }
    },
    Bar: {
      name: 'Bar',
      fields: {
        color: { type: { nonNull: 'String' } }
      }
    },
    Boolean: {
      name: 'Boolean',
      resolve: ({ value, path }) => {
        if (typeof value === 'boolean') return value;

        throw new Error(
          `Expected a "Boolean" but got ${JSON.stringify(value)} ${path}`
        );
      }
    },
    String: {
      name: 'String',
      args: {
        maxLength: 'Number'
      },
      resolve: ({ args: { maxLength }, path, value }) => {
        if (typeof value !== 'string') {
          throw new Error(
            `Expected a "String" but got ${JSON.stringify(value)} ${path}`
          );
        }

        if (maxLength != null && value.length > maxLength) {
          throw new Error(`String cannot be more than ${maxLength} ${path}`);
        }

        return value;
      }
    },
    NullableString: {
      name: 'NullableString',
      resolve: ({ value }) => value.trim() || null
    },
    Number: {
      name: 'Number',
      resolve: ({ value, path }) => {
        if (typeof value === 'number') return value;

        throw new Error(
          `Expected a "Number" but got ${JSON.stringify(value)} ${path}`
        );
      }
    }
  };

  const query = {
    nullableStringA: {
      _field: 'nullableString',
      _args: { string: 'not null' }
    },
    nullableStringB: { _field: 'nullableString', _args: { string: '   ' } },
    nullableStringC: {
      _field: 'nonNullableNullableString',
      _args: { string: 'not null' }
    },
    nullableStringD: {
      _field: 'nonNullableNullableString',
      _args: { string: '  a  ' }
    },
    nullableStringE: {
      _field: 'nullableStringArg',
      _args: { string: 'not null' }
    },
    nullableStringF: { _field: 'nullableStringArg', _args: { string: '   ' } },
    selfLink: {
      selfLinkWithAddition: {
        addition: {}
      }
    },
    things: {
      _type: {},
      _onFoo: {
        id: {},
        name: {
          _args: {
            separator: ' '
          }
        },
        sub: {
          _field: 'subFoo',
          id: {},
          subSub: {
            _field: 'subFoo',
            id: {}
          }
        }
      },
      _onBar: {
        color: {}
      }
    }
  };

  const expected = {
    nullableStringA: 'not null',
    nullableStringB: null,
    nullableStringC: 'not null',
    nullableStringD: 'a',
    nullableStringE: 'not null',
    nullableStringF: null,
    selfLink: {
      selfLinkWithAddition: {
        addition: true
      }
    },
    things: [
      {
        _type: 'Foo',
        name: 'Default name Default name',
        id: 1,
        sub: { id: 123, subSub: { id: 123 } }
      },
      {
        _type: 'Foo',
        name: 'foo foo',
        id: '2',
        sub: { id: 123, subSub: { id: 123 } }
      },
      { _type: 'Bar', color: 'blue' }
    ]
  };

  assert.deepEqual(
    await execute({
      query: validateQuery({ query, schema, type: 'Root' }),
      schema,
      type: 'Root'
    }),
    expected
  );
};
