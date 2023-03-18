import { strict as assert } from 'assert';

import validateQuery from './validate-query.js';

export default {
  simple: () => {
    assert.deepEqual(
      validateQuery({
        schema: {
          Root: {
            object: {
              sum: {
                args: {
                  object: { a: 'Int', b: 'Int' },
                  validate: ({ query, value }) => {
                    if (query.root) {
                      assert.deepEqual(query.root.sum._args, { a: 3, b: 4 });
                    }
                    return value;
                  }
                },
                type: { object: { result: 'Int', root: 'Root' } }
              }
            },
            defaultValue: {}
          },
          Int: { resolve: ({ value }) => +value }
        },
        type: 'Root',
        query: {
          total: {
            _key: 'sum',
            _type: { _args: 'foo' },
            _args: { a: '1', b: 2 },
            result: {},
            root: { sum: { _args: { a: 3, b: '4' } } }
          }
        }
      }),
      {
        total: {
          _key: 'sum',
          _type: {},
          _args: { a: 1, b: 2 },
          result: {},
          root: { sum: { _args: { a: 3, b: 4 } } }
        }
      }
    );
  },

  complex: () => {
    assert.deepEqual(
      validateQuery({
        schema: {
          Root: {
            object: {
              sum: {
                args: {
                  object: {
                    a: 'Int',
                    b: {
                      defaultValue: 1,
                      type: { typeArgs: { min: 1 }, type: 'Int' }
                    }
                  }
                },
                type: { notNull: 'Int' }
              },
              def: {
                args: {
                  object: {
                    a: { defaultValue: 3, type: 'Int' }
                  },
                  defaultValue: {}
                }
              },
              obj: {
                type: 'Obj',
                args: { object: { id: 'Int' } }
              },
              oneOf: {
                oneOf: { Foo: 'Foo', Bar: 'Bar' }
              }
            }
          },
          Obj: {
            object: {
              name: 'String',
              obj: 'Obj'
            }
          },
          Foo: {
            object: {
              id: { args: { object: { name: 'String' } } },
              fooKey: {}
            }
          },
          Bar: {
            object: {
              id: {},
              barKey: {},
              status: 'Status'
            }
          },
          Int: {
            args: {
              object: { min: { defaultValue: 2 }, max: { optional: 'Int' } },
              defaultValue: {}
            },
            resolve: ({ args: { min, max }, value }) => {
              if (!Number.isInteger(value)) {
                throw new Error(`Not an int: ${value}`);
              }

              if (min != null && value < min) throw new Error('Too small');

              if (max != null && value > max) throw new Error('Too big');

              return value;
            }
          },
          String: {
            resolve: ({ value }) => {
              if (typeof value === 'string') return value;

              throw new Error(`Not a string: ${value}`);
            }
          },
          Enum: {
            type: 'String',
            args: { object: { values: { arrayOf: 'String' } } },
            resolve: ({ args: { values }, value }) => {
              if (values.includes(value)) return value;

              throw new Error(
                `Expected ${JSON.stringify(value)} to be one of ${values.join(
                  ', '
                )}`
              );
            }
          },
          Status: {
            type: 'Enum',
            typeArgs: { values: ['pending', 'complete', 'failed'] }
          }
        },
        query: {
          _type: {},
          objAlias: {
            _args: { id: 3 },
            _key: 'obj',
            name: {},
            objAlias2: { _key: 'obj', name: {} }
          },
          sum: { _args: { a: 3 } },
          def: {},
          oneOf: {
            _key: 'oneOf',
            _type: {},
            _on_Bar: { id: { _type: {} }, status: {} },
            _on_Foo: {
              _type: {},
              id: { _args: { name: 'foo' }, _type: {} },
              fooKey: {}
            }
          }
        },
        type: 'Root'
      }),
      {
        _type: {},
        objAlias: {
          _args: { id: 3 },
          _key: 'obj',
          name: {},
          objAlias2: { _key: 'obj', name: {} }
        },
        sum: { _args: { a: 3, b: 1 } },
        def: { _args: { a: 3 } },
        oneOf: {
          _on_Bar: { id: {}, status: {} },
          _on_Foo: { id: { _args: { name: 'foo' } }, _type: {}, fooKey: {} }
        }
      }
    );
  }
};
