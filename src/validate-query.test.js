import { strict as assert } from 'assert';

import validateQuery from './validate-query.js';

export default {
  simple: () => {
    assert.deepEqual(
      validateQuery({
        schema: {
          Root: {
            fields: {
              sum: {
                args: { a: { nonNull: 'Int' }, b: { nonNull: 'Int' } },
                type: { notNull: 'Int' }
              }
            }
          },
          Int: {}
        },
        type: 'Root',
        query: {
          total: {
            _field: 'sum',
            _type: { _args: 'foo' },
            _args: { a: 1, b: 2 }
          }
        }
      }),
      { total: { _field: 'sum', _type: {}, _args: { a: 1, b: 2 } } }
    );
  },

  complex: () => {
    assert.deepEqual(
      validateQuery({
        schema: {
          Root: {
            fields: {
              sum: {
                args: {
                  a: {
                    nonNull: 'Int'
                  },
                  b: {
                    defaultValue: 1,
                    nonNull: { typeArgs: { min: 1 }, type: 'Int' }
                  }
                },
                type: { notNull: 'Int' }
              },
              obj: {
                type: 'Obj',
                args: { id: 'Int' }
              },
              oneOf: {
                oneOf: ['Foo', 'Bar']
              }
            }
          },
          Obj: {
            name: 'Obj',
            fields: {
              name: 'String',
              obj: 'Obj'
            }
          },
          Foo: {
            name: 'Foo',
            fields: {
              id: { args: { name: 'String' } },
              fooField: {}
            }
          },
          Bar: {
            name: 'Bar',
            fields: {
              id: {},
              barField: {}
            }
          },
          Int: {
            args: { min: { defaultValue: 2 }, max: 'Int' },
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
          }
        },
        query: {
          _type: {},
          objAlias: {
            _args: { id: 3 },
            _field: 'obj',
            name: 123,
            objAlias2: { _field: 'obj', name: {} }
          },
          sum: { _args: { a: 3 } },
          oneOf: {
            id: { _type: {} },
            _onFoo: {
              _type: {},
              id: { _args: { name: 'foo' }, _type: {} },
              fooField: { _args: {} }
            }
          }
        },
        type: 'Root'
      }),
      {
        _type: {},
        objAlias: {
          _args: { id: 3 },
          _field: 'obj',
          name: {},
          objAlias2: { _field: 'obj', name: {} }
        },
        sum: { _args: { a: 3, b: 1 } },
        oneOf: {
          _onBar: { id: { _type: {} } },
          _onFoo: {
            id: { _args: { name: 'foo' }, _type: {} },
            _type: {},
            fooField: {}
          }
        }
      }
    );
  }
};
