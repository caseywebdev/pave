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
              }
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
          id: {}
        }
      },
      _onBar: {
        color: {}
      }
    }
  };

  const expected = {
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
        sub: { id: 123 }
      },
      { _type: 'Foo', name: 'foo foo', id: '2', sub: { id: 123 } },
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
