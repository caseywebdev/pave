import { strict as assert } from 'assert';

import execute from './execute.js';

export default {
  '#only': async () => {
    assert.deepEqual(
      await execute({
        schema: {
          Root: {
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
        fields: {
          _type: { type: { nonNull: 'String' }, resolve: 'Root' },
          addition: 'Boolean',
          selfLink: 'Root',
          selfLinkWithAddition: {
            type: 'Root',
            resolve: { addition: true }
          },
          things: {
            type: { nonNull: { arrayOf: { nonNull: () => 'Foo' } } },
            resolve: [{ id: 1 }, { id: '2', name: 'foo' }]
          }
        }
      },
      Foo: {
        fields: {
          _type: { type: { nonNull: 'String' }, resolve: 'Foo' },
          id: {
            type: {
              nonNull: value =>
                typeof value === 'number' ? 'Number' : 'String'
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
            resolve: () => () => ({ args: { separator }, value }) => () => () =>
              `${value}${separator}${value}`
          }
        }
      },
      Boolean: {
        resolve: ({ value, path }) => {
          if (typeof value === 'boolean') return value;

          throw new Error(
            `Expected a "Boolean" but got ${JSON.stringify(value)} ${path}`
          );
        }
      },
      String: {
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
        resolve: ({ value, path }) => {
          if (value == null) return null;

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
        id: {},
        dne: {},
        name: {
          _args: {
            separator: ' '
          }
        },
        sub: {
          _field: 'subFoo',
          id: {}
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
          dne: null,
          id: 1,
          sub: { id: 123 }
        },
        { _type: 'Foo', name: 'foo foo', dne: null, id: '2', sub: { id: 123 } }
      ]
    };

    assert.deepEqual(await execute({ query, schema, type: 'Root' }), expected);
  }
};
