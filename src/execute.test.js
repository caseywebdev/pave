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
          obj: {
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
    obj: {
      a: 'String',
      a2: 'String'
    }
  };

  const ThingB = {
    obj: {
      b: 'String',
      b2: 'String'
    }
  };

  const recursiveType = {};
  recursiveType.optional = { nullable: { obj: { recursiveType } } };

  const schema = validateSchema({
    schema: {
      Root: {
        defaultValue: {},
        obj: {
          addition: 'Boolean',
          nullableString: {
            arg: {
              obj: { string: { nullable: 'String' } },
              validate: ({ value: { string } }) => ({ rename: string })
            },
            type: { nullable: 'NullableString' },
            resolve: ({ arg: { rename } }) => rename
          },
          nonNullableNullableString: {
            arg: { obj: { string: 'String' } },
            type: 'NullableString',
            resolve: ({ arg: { string } }) => string
          },
          nullableStringArg: {
            arg: { obj: { string: { nullable: 'NullableString' } } },
            type: { nullable: 'String' },
            resolve: ({ arg: { string } }) => string
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
          oneOfArg: {
            arg: {
              obj: {
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
                String: { type: 'String', typeArg: { maxLength: 3 } },
                ThingA,
                ThingB
              },
              resolveType: val =>
                typeof val === 'string' ? 'String' : val.a ? 'ThingA' : 'ThingB'
            },
            resolve: ({ arg: { thing } }) => thing
          },
          nullableObject: {
            type: {
              nullable: {
                obj: {
                  a: 'String'
                }
              }
            },
            resolve: () => {}
          },
          nullableArrayOf: {
            type: {
              nullable: {
                arrayOf: 'String'
              }
            }
          },
          nullableOneOf: {
            type: {
              nullable: {
                oneOf: { string: 'String', number: 'Number' },
                resolveType: value => typeof value
              }
            }
          },
          arrayOfStrings: {
            type: {
              arrayOf: 'String'
            },
            resolve: ['a', 'b', 'c']
          },
          tuple: {
            type: ['Bar', 'TrimmedString'],
            resolve: [{ color: 'red' }, ' trim me ']
          }
        }
      },
      Foo: {
        obj: {
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
            arg: {
              obj: {
                separator: { type: 'String', typeArg: { maxLength: 3 } }
              }
            },
            type: 'String',
            resolve: ({ arg: { separator }, value }) =>
              `${value}${separator}${value}`
          }
        }
      },
      Bar: {
        obj: {
          color: { type: 'String' }
        }
      },
      Boolean: {
        resolve: ({ value }) => {
          if (typeof value === 'boolean') return value;
        }
      },
      String: {
        arg: {
          obj: {
            maxLength: { optional: 'Number' },
            validate: { optional: {} }
          },
          defaultValue: {}
        },
        resolve: ({ arg: { maxLength, validate }, path, value }) => {
          if (typeof value !== 'string') {
            throw new Error(
              `Expected a "String" but got ${JSON.stringify(value)} ${path}`
            );
          }

          if (maxLength != null && value.length > maxLength) {
            throw new Error(`String cannot be more than ${maxLength} ${path}`);
          }

          if (validate) value = validate(value);

          return value;
        }
      },
      TrimmedString: {
        type: 'String',
        validate: ({ value }) => value.trim()
      },
      NullableString: {
        validate: ({ value }) => value.trim() || null
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
        _arg: { string: 'not null' }
      },
      nullableStringB: { _key: 'nullableString', _arg: { string: '   ' } },
      nullableStringC: {
        _key: 'nonNullableNullableString',
        _arg: { string: 'not null' }
      },
      nullableStringD: {
        _key: 'nonNullableNullableString',
        _arg: { string: '  a  ' }
      },
      nullableStringE: {
        _key: 'nullableStringArg',
        _arg: { string: 'not null' }
      },
      nullableStringF: {
        _key: 'nullableStringArg',
        _arg: { string: '   ' }
      },
      selfLink: {
        selfLinkWithAddition: {
          addition: {}
        }
      },
      things: {
        _on_f: {
          _type: {},
          id: {},
          name: {
            _arg: {
              separator: ' '
            }
          },
          sub: {
            _key: 'subFoo',
            id: {},
            subSub: {
              _key: 'subFoo',
              id: {}
            }
          }
        },
        _on_b: {
          _type: {},
          color: {}
        }
      },
      oneOfArgString: {
        _arg: { thing: 'str' },
        _key: 'oneOfArg'
      },
      oneOfArgA: {
        _arg: { thing: { a: 'A', a2: 'A2' } },
        _key: 'oneOfArg',
        _on_ThingA: {
          _type: {},
          a: {}
        }
      },
      oneOfArgB: {
        _arg: { thing: { b: 'B', b2: 'B2' } },
        _key: 'oneOfArg',
        _on_ThingB: {
          _type: {},
          b2: {}
        }
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
    ],
    oneOfArgString: 'str',
    oneOfArgA: { _type: 'ThingA', a: 'A' },
    oneOfArgB: { _type: 'ThingB', b2: 'B2' },
    nullableObject: null,
    nullableArrayOf: null,
    nullableOneOf: null,
    arrayOfStrings: ['a', 'b', 'c'],
    tuple: { 0: { color: 'red' }, 1: 'trim me' }
  };

  assert.deepEqual(await execute({ query, schema, type: 'Root' }), expected);
};
