import { strict as assert } from 'assert';

import execute from './execute.js';
import validateQuery from './validate-query.js';
import validateSchema from './validate-schema.js';

export default async () => {
  assert.deepEqual(
    await execute({
      schema: {
        Root: {
          defaultValue: {},
          object: {
            a: { resolve: async () => 1 }
          }
        }
      },
      type: 'Root',
      query: { a: {} }
    }),
    { a: 1 }
  );

  const ThingA = {
    object: {
      a: 'String',
      a2: 'String'
    }
  };

  const ThingB = {
    object: {
      b: 'String',
      b2: 'String'
    }
  };

  const recursiveType = {};
  recursiveType.optional = { nullable: { object: { recursiveType } } };

  const schema = validateSchema({
    schema: {
      Root: {
        defaultValue: {},
        object: {
          addition: 'Boolean',
          nullableString: {
            args: {
              object: { string: { nullable: 'String' } },
              validate: ({ value: { string } }) => ({ rename: string })
            },
            type: { nullable: 'NullableString' },
            resolve: ({ args: { rename } }) => rename
          },
          nonNullableNullableString: {
            args: { object: { string: 'String' } },
            type: 'NullableString',
            resolve: ({ args: { string } }) => string
          },
          nullableStringArgs: {
            args: { object: { string: { nullable: 'NullableString' } } },
            type: { nullable: 'String' },
            resolve: ({ args: { string } }) => string
          },
          selfLink: 'Root',
          selfLinkWithAddition: {
            type: 'Root',
            resolve: { addition: true }
          },
          things: {
            type: {
              arrayOf: {
                oneOf: { b: 'Bar', f: 'Foo' },
                resolveType: ({ id }) => (id ? 'f' : 'b')
              },
              minLength: 1,
              maxLength: 10
            },
            resolve: () => [
              { id: 1 },
              { id: '2', name: 'foo' },
              { color: 'blue' }
            ]
          },
          oneOfArgs: {
            args: {
              object: {
                thing: {
                  oneOf: { String: 'String', ThingA, ThingB },
                  resolveType: val =>
                    typeof val === 'string'
                      ? 'String'
                      : val.a
                      ? 'ThingA'
                      : 'ThingB'
                }
              }
            },
            type: {
              oneOf: {
                String: { type: 'String', typeArgs: { maxLength: 3 } },
                ThingA,
                ThingB
              },
              resolveType: val =>
                typeof val === 'string' ? 'String' : val.a ? 'ThingA' : 'ThingB'
            },
            resolve: ({ args: { thing } }) => thing
          },
          nullableObject: {
            type: {
              nullable: {
                object: {
                  a: 'String'
                }
              }
            },
            resolve: () => {}
          },
          nullableArrayOf: { nullable: { arrayOf: 'String' } },
          nullableOneOf: {
            nullable: {
              oneOf: { string: 'String', number: 'Number' },
              resolveType: value => typeof value
            }
          },
          arrayOfStrings: {
            type: { arrayOf: 'String' },
            resolve: ['a', 'b', 'c']
          },
          tuple: {
            type: ['Bar', 'TrimmedString'],
            resolve: [{ color: 'red' }, ' trim me ']
          }
        }
      },
      Foo: {
        object: {
          id: {
            type: {
              oneOf: { number: 'Number', string: 'String' },
              resolveType: value => typeof value
            }
          },
          subFoo: {
            type: 'Foo',
            resolve: async () => await { id: 123 },
            validate: ({ value }) => value
          },
          name: {
            defaultValue: 'Default name',
            args: {
              object: {
                separator: { type: 'String', typeArgs: { maxLength: 3 } }
              }
            },
            type: 'String',
            resolve: ({ args: { separator }, value }) =>
              `${value}${separator}${value}`
          }
        }
      },
      Bar: { object: { color: { type: 'String' } }, defaultType: {} },
      Boolean: {
        resolve: ({ value }) => {
          if (typeof value === 'boolean') return value;
        }
      },
      String: {
        args: {
          object: { maxLength: { optional: 'Number' } },
          defaultValue: {}
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
      TrimmedString: {
        type: 'String',
        validate: ({ value }) => value.trim()
      },
      NullableString: {
        type: 'TrimmedString',
        validate: ({ value }) => value || null
      },
      Number: {
        validate: ({ value, path }) => {
          if (typeof value === 'number') return value;

          throw new Error(
            `Expected a "Number" but got ${JSON.stringify(value)} ${path}`
          );
        }
      },
      recursiveType
    }
  });

  const query = validateQuery({
    query: {
      _type: {},
      nullableStringA: {
        _key: 'nullableString',
        _args: { string: 'not null' }
      },
      nullableStringB: { _key: 'nullableString', _args: { string: '   ' } },
      nullableStringC: {
        _key: 'nonNullableNullableString',
        _args: { string: 'not null' }
      },
      nullableStringD: {
        _key: 'nonNullableNullableString',
        _args: { string: '  a  ' }
      },
      nullableStringE: {
        _key: 'nullableStringArgs',
        _args: { string: 'not null' }
      },
      nullableStringF: {
        _key: 'nullableStringArgs',
        _args: { string: '   ' }
      },
      selfLink: { selfLinkWithAddition: { addition: {} } },
      things: {
        _on_f: {
          _type: {},
          id: {},
          name: { _args: { separator: ' ' } },
          sub: {
            _key: 'subFoo',
            id: {},
            subSub: { _key: 'subFoo', id: {} }
          }
        },
        _on_b: { _type: {}, color: {} }
      },
      oneOfArgsString: { _key: 'oneOfArgs', _args: { thing: 'str' } },
      oneOfArgsA: {
        _key: 'oneOfArgs',
        _args: { thing: { a: 'A', a2: 'A2' } },
        _on_ThingA: { _type: {}, a: {} }
      },
      oneOfArgsB: {
        _key: 'oneOfArgs',
        _args: { thing: { b: 'B', b2: 'B2' } },
        _on_ThingB: { _type: {}, b2: {} }
      },
      nullableObject: { a: {} },
      nullableArrayOf: {},
      nullableOneOf: {},
      arrayOfStrings: {},
      tuple: [{ color: {} }, {}]
    },
    schema,
    type: 'Root'
  });

  const expected = {
    _type: 'Root',
    nullableStringA: 'not null',
    nullableStringB: null,
    nullableStringC: 'not null',
    nullableStringD: 'a',
    nullableStringE: 'not null',
    nullableStringF: null,
    selfLink: { selfLinkWithAddition: { addition: true } },
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
    ],
    oneOfArgsString: 'str',
    oneOfArgsA: { _type: 'ThingA', a: 'A' },
    oneOfArgsB: { _type: 'ThingB', b2: 'B2' },
    nullableObject: null,
    nullableArrayOf: null,
    nullableOneOf: null,
    arrayOfStrings: ['a', 'b', 'c'],
    tuple: { 0: { color: 'red' }, 1: 'trim me' }
  };

  assert.deepEqual(await execute({ query, schema, type: 'Root' }), expected);
};
