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
                arg: { object: { a: 'Int', b: 'Int' } },
                type: 'Int'
              }
            }
          },
          Int: {}
        },
        type: 'Root',
        query: {
          total: {
            _key: 'sum',
            _type: { _arg: 'foo' },
            _arg: { a: 1, b: 2 }
          }
        }
      }),
      {
        total: { _key: 'sum', _arg: { a: 1, b: 2 } }
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
                arg: {
                  object: {
                    a: 'Int',
                    b: {
                      defaultValue: 1,
                      type: { typeArg: { min: 1 }, type: 'Int' }
                    }
                  }
                },
                type: { notNull: 'Int' }
              },
              def: {
                arg: {
                  object: {
                    a: { defaultValue: 3, type: 'Int' }
                  },
                  defaultValue: {}
                }
              },
              obj: {
                type: 'Obj',
                arg: { object: { id: 'Int' } }
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
              id: { arg: { object: { name: 'String' } } },
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
            arg: {
              object: { min: { defaultValue: 2 }, max: { optional: 'Int' } },
              defaultValue: {}
            },
            resolve: ({ arg: { min, max }, value }) => {
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
            arg: { object: { values: { arrayOf: 'String' } } },
            resolve: ({ arg: { values }, value }) => {
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
            typeArg: { values: ['pending', 'complete', 'failed'] }
          }
        },
        query: {
          _type: {},
          objAlias: {
            _arg: { id: 3 },
            _key: 'obj',
            name: {},
            objAlias2: { _key: 'obj', name: {} }
          },
          sum: { _arg: { a: 3 } },
          def: {},
          oneOf: {
            _key: 'oneOf',
            _type: {},
            _on_Bar: { id: { _type: {} }, status: {} },
            _on_Foo: {
              _type: {},
              id: { _arg: { name: 'foo' }, _type: {} },
              fooKey: {}
            }
          }
        },
        type: 'Root'
      }),
      {
        _type: {},
        objAlias: {
          _arg: { id: 3 },
          _key: 'obj',
          name: {},
          objAlias2: { _key: 'obj', name: {} }
        },
        sum: { _arg: { a: 3, b: 1 } },
        def: { _arg: { a: 3 } },
        oneOf: {
          _on_Bar: { id: {}, status: {} },
          _on_Foo: {
            id: { _arg: { name: 'foo' } },
            _type: {},
            fooKey: {}
          }
        }
      }
    );
  }
};
