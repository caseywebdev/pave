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
            input: {
              object: { string: { nullable: 'String' } },
              validate: ({ value: { string } }) => ({ rename: string })
            },
            type: { nullable: 'NullableString' },
            resolve: ({ input: { rename } }) => rename
          },
          nonNullableNullableString: {
            input: { object: { string: 'String' } },
            type: 'NullableString',
            resolve: ({ input: { string } }) => string
          },
          nullableStringArgs: {
            input: { object: { string: { nullable: 'NullableString' } } },
            type: { nullable: 'String' },
            resolve: ({ input: { string } }) => string
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
            input: {
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
                String: { type: 'String', typeInput: { maxLength: 3 } },
                ThingA,
                ThingB
              },
              resolveType: val =>
                typeof val === 'string' ? 'String' : val.a ? 'ThingA' : 'ThingB'
            },
            resolve: ({ input: { thing } }) => thing
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
          },
          value: {
            input: {
              object: {
                hello: { optional: { type: 'constant', typeInput: 'hello' } },
                null: { nullable: { type: 'constant', typeInput: null } },
                one: { type: 'constant', typeInput: 1 }
              }
            },
            resolve: ({ input }) => input
          }
        }
      },
      constant: {
        input: { nullable: {} },
        resolve: ({ path, input, value }) => {
          if (value !== input) {
            throw new Error(
              `${value} should equal ${input} at ${path.join('.')}`
            );
          }

          return value;
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
            input: {
              object: {
                separator: { type: 'String', typeInput: { maxLength: 3 } }
              }
            },
            type: 'String',
            resolve: ({ input: { separator }, value }) =>
              `${value}${separator}${value}`
          }
        }
      },
      Bar: {
        object: { color: { type: 'String' } },
        defaultType: { resolve: ({ path }) => path.at(-1) }
      },
      Boolean: {
        resolve: ({ value }) => {
          if (typeof value === 'boolean') return value;
        }
      },
      String: {
        input: {
          object: { maxLength: { optional: 'Number' } },
          defaultValue: {}
        },
        resolve: ({ input: { maxLength }, path, value }) => {
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
        _: 'nullableString',
        $: { string: 'not null' }
      },
      nullableStringB: { _: 'nullableString', $: { string: '   ' } },
      nullableStringC: {
        _: 'nonNullableNullableString',
        $: { string: 'not null' }
      },
      nullableStringD: {
        _: 'nonNullableNullableString',
        $: { string: '  a  ' }
      },
      nullableStringE: {
        _: 'nullableStringArgs',
        $: { string: 'not null' }
      },
      nullableStringF: {
        _: 'nullableStringArgs',
        $: { string: '   ' }
      },
      selfLink: { selfLinkWithAddition: { addition: {} } },
      things: {
        _on_f: {
          _type: {},
          id: {},
          name: { $: { separator: ' ' } },
          sub: {
            _: 'subFoo',
            id: {},
            subSub: { _: 'subFoo', id: {} }
          }
        },
        _on_b: { _type: {}, color: {} }
      },
      oneOfArgsString: { _: 'oneOfArgs', $: { thing: 'str' } },
      oneOfArgsA: {
        _: 'oneOfArgs',
        $: { thing: { a: 'A', a2: 'A2' } },
        _on_ThingA: { _type: {}, a: {} }
      },
      oneOfArgsB: {
        _: 'oneOfArgs',
        $: { thing: { b: 'B', b2: 'B2' } },
        _on_ThingB: { _type: {}, b2: {} }
      },
      nullableObject: { a: {} },
      nullableArrayOf: {},
      nullableOneOf: {},
      arrayOfStrings: {},
      tuple: [{ color: {}, any1: {}, any2: {} }, {}],
      tuple2: {
        _: 'tuple',
        0: { _type: {}, type2: { _: '_type' } },
        1: {}
      },
      value: { $: { null: null, one: 1 } }
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
    tuple: { 0: { color: 'red', any1: 'any1', any2: 'any2' }, 1: 'trim me' },
    tuple2: { 0: { _type: 'Bar', type2: 'Bar', color: 'red' }, 1: 'trim me' },
    value: { null: null, one: 1 }
  };

  assert.deepEqual(await execute({ query, schema, type: 'Root' }), expected);
};
