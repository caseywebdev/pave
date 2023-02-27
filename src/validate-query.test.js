import { strict as assert } from 'assert';

import validateQuery from './validate-query.js';

export default {
  simple: () => {
    assert.deepEqual(
      validateQuery({
        schema: {
          Root: {
            obj: {
              sum: {
                $: { obj: { a: 'Int', b: 'Int' } },
                type: 'Int'
              }
            }
          },
          Int: {}
        },
        type: 'Root',
        query: {
          total: {
            _: 'sum',
            _type: { $: 'foo' },
            $: { a: 1, b: 2 }
          }
        }
      }),
      {
        total: { _: 'sum', $: { a: 1, b: 2 } }
      }
    );
  },

  complex: () => {
    assert.deepEqual(
      validateQuery({
        schema: {
          Root: {
            obj: {
              sum: {
                $: {
                  obj: {
                    a: 'Int',
                    b: {
                      defaultValue: 1,
                      type: { type$: { min: 1 }, type: 'Int' }
                    }
                  }
                },
                type: { notNull: 'Int' }
              },
              def: {
                $: {
                  obj: {
                    a: { defaultValue: 3, type: 'Int' }
                  },
                  defaultValue: {}
                }
              },
              obj: {
                type: 'Obj',
                $: { obj: { id: 'Int' } }
              },
              oneOf: {
                oneOf: { Foo: 'Foo', Bar: 'Bar' }
              }
            }
          },
          Obj: {
            obj: {
              name: 'String',
              obj: 'Obj'
            }
          },
          Foo: {
            obj: {
              id: { $: { obj: { name: 'String' } } },
              fooKey: {}
            }
          },
          Bar: {
            obj: {
              id: {},
              barKey: {},
              status: 'Status'
            }
          },
          Int: {
            $: {
              obj: { min: { defaultValue: 2 }, max: { optional: 'Int' } },
              defaultValue: {}
            },
            resolve: ({ $: { min, max }, value }) => {
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
            $: { obj: { values: { arrayOf: 'String' } } },
            resolve: ({ $: { values }, value }) => {
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
            type$: { values: ['pending', 'complete', 'failed'] }
          }
        },
        query: {
          _type: {},
          objAlias: {
            $: { id: 3 },
            _: 'obj',
            name: {},
            objAlias2: { _: 'obj', name: {} }
          },
          sum: { $: { a: 3 } },
          def: {},
          oneOf: {
            _: 'oneOf',
            _type: {},
            _on_Bar: { id: { _type: {} }, status: {} },
            _on_Foo: {
              _type: {},
              id: { $: { name: 'foo' }, _type: {} },
              fooKey: {}
            }
          }
        },
        type: 'Root'
      }),
      {
        _type: {},
        objAlias: {
          $: { id: 3 },
          _: 'obj',
          name: {},
          objAlias2: { _: 'obj', name: {} }
        },
        sum: { $: { a: 3, b: 1 } },
        def: { $: { a: 3 } },
        oneOf: {
          _on_Bar: { id: {}, status: {} },
          _on_Foo: {
            id: { $: { name: 'foo' } },
            _type: {},
            fooKey: {}
          }
        }
      }
    );
  }
};
