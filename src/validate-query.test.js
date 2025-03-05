import { strict as assert } from 'node:assert';

import { validateQuery } from '#src/validate-query.js';

export default {
  simple: () => {
    assert.deepEqual(
      validateQuery({
        schema: {
          Root: {
            object: {
              sum: {
                input: {
                  type: ['Int', 'Int'],
                  validate: ({ query, value }) => {
                    if (query.root) {
                      assert.deepEqual(query.root.sum.$, [3, 4]);
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
            _: 'sum',
            $: ['1', 2],
            _type: { $: 'foo' },
            result: {},
            root: { sum: { $: [3, '4'] } }
          }
        }
      }),
      {
        total: {
          _: 'sum',
          _type: {},
          $: [1, 2],
          result: {},
          root: { sum: { $: [3, 4] } }
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
                input: {
                  object: {
                    a: 'Int',
                    b: {
                      defaultValue: 1,
                      type: { typeInput: { min: 1 }, type: 'Int' }
                    }
                  }
                },
                type: { notNull: 'Int' }
              },
              def: {
                input: {
                  object: { a: { defaultValue: 3, type: 'Int' } },
                  defaultValue: {}
                }
              },
              obj: { type: 'Obj', input: { object: { id: 'Int' } } },
              oneOf: { oneOf: { Foo: 'Foo', Bar: 'Bar' } },
              anyKey: {
                object: { extraKey: { object: { foo: 'String' } } },
                defaultType: {}
              }
            }
          },
          Obj: { object: { name: 'String', obj: 'Obj' } },
          Foo: {
            object: {
              id: { input: { object: { name: 'String' } } },
              fooKey: {}
            }
          },
          Bar: { object: { id: {}, barKey: {}, status: 'Status' } },
          Int: {
            input: {
              object: { min: { defaultValue: 2 }, max: { optional: 'Int' } },
              defaultValue: {}
            },
            resolve: ({ input: { min, max }, value }) => {
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
            input: { object: { values: { arrayOf: 'String' } } },
            resolve: ({ input: { values }, value }) => {
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
            typeInput: { values: ['pending', 'complete', 'failed'] }
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
          },
          anyKey: { anything: {}, extraKey: { foo: {} } }
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
          _on_Foo: { id: { $: { name: 'foo' } }, _type: {}, fooKey: {} }
        },
        anyKey: { anything: {}, extraKey: { foo: {} } }
      }
    );
  }
};
