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

  const ThingA = {
    fields: {
      a: 'String',
      a2: 'String'
    }
  };

  const ThingB = {
    fields: {
      b: 'String',
      b2: 'String'
    }
  };

  const schema = {
    Root: {
      defaultValue: {},
      fields: {
        addition: 'Boolean',
        nullableString: {
          args: { string: { nullable: 'String' } },
          type: { nullable: 'NullableString' },
          resolve: ({ args: { string } }) => string
        },
        nonNullableNullableString: {
          args: { string: 'String' },
          type: 'NullableString',
          resolve: ({ args: { string } }) => string
        },
        nullableStringArg: {
          args: { string: { nullable: 'NullableString' } },
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
          resolve: () => () => () => () => () =>
            [{ id: 1 }, { id: '2', name: 'foo' }, { color: 'blue' }]
        },
        oneOfArgs: {
          args: {
            thing: {
              oneOf: { String: 'String', ThingA, ThingB },
              resolveType: val =>
                typeof val === 'string' ? 'String' : val.a ? 'ThingA' : 'ThingB'
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
        nullableFields: {
          type: {
            nullable: {
              fields: {
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
              oneOf: { String, Number }
            }
          }
        },
        arrayOfStrings: {
          type: {
            arrayOf: 'String'
          },
          resolve: ['a', 'b', 'c']
        }
      }
    },
    Foo: {
      fields: {
        id: {
          type: {
            oneOf: { Number: 'Number', String: 'String' },
            resolveType: value =>
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
            separator: { type: 'String', typeArgs: { maxLength: 3 } }
          },
          type: 'String',
          resolve:
            ({ args: { separator }, value }) =>
            () =>
            () =>
              `${value}${separator}${value}`
        }
      }
    },
    Bar: {
      fields: {
        color: { type: 'String' }
      }
    },
    Boolean: {
      resolve: ({ value }) => {
        if (typeof value === 'boolean') return value;
      }
    },
    String: {
      args: {
        maxLength: { optional: 'Number' }
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
      resolve: ({ value }) => value.trim() || null
    },
    Number: {
      resolve: ({ value, path }) => {
        if (typeof value === 'number') return value;

        throw new Error(
          `Expected a "Number" but got ${JSON.stringify(value)} ${path}`
        );
      }
    }
  };

  let query = {
    _type: {},
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
    nullableStringF: {
      _field: 'nullableStringArg',
      _args: { string: '   ' }
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
      _on_b: {
        _type: {},
        color: {}
      }
    },
    oneOfArgsString: {
      _args: { thing: 'str' },
      _field: 'oneOfArgs'
    },
    oneOfArgsA: {
      _args: { thing: { a: 'A', a2: 'A2' } },
      _field: 'oneOfArgs',
      _on_ThingA: {
        _type: {},
        a: {}
      }
    },
    oneOfArgsB: {
      _args: { thing: { b: 'B', b2: 'B2' } },
      _field: 'oneOfArgs',
      _on_ThingB: {
        _type: {},
        b2: {}
      }
    },
    nullableFields: { a: {} },
    nullableArrayOf: {},
    nullableOneOf: {},
    arrayOfStrings: {}
  };

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
    oneOfArgsString: 'str',
    oneOfArgsA: { _type: 'ThingA', a: 'A' },
    oneOfArgsB: { _type: 'ThingB', b2: 'B2' },
    nullableFields: null,
    nullableArrayOf: null,
    nullableOneOf: null,
    arrayOfStrings: ['a', 'b', 'c']
  };

  query = validateQuery({ query, schema, type: 'Root' });

  assert.deepEqual(await execute({ query, schema, type: 'Root' }), expected);
};
