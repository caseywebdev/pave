import { strict as assert } from 'assert';

import getQueryCost from './get-query-cost.js';
import validateSchema from './validate-schema.js';

export default () => {
  assert.equal(
    getQueryCost({
      schema: validateSchema({
        schema: {
          Root: {
            cost: ({ cost }) => cost * 3,
            obj: {
              foo: {
                cost: 5
              },
              bar: { cost: 10 },
              baz: {
                arg: { obj: { size: {} } },
                cost: ({ arg: { size }, cost, path }) => {
                  assert.deepEqual(path, ['baz']);
                  return size * cost;
                },
                type: {
                  obj: {
                    a: { cost: 1 },
                    b: { cost: 2 },
                    c: { cost: 3 }
                  }
                }
              },
              oneOf: {
                oneOf: {
                  SuperExpensive: 'SuperExpensive',
                  MediumExpensive: {
                    nullable: {
                      obj: { ding: { cost: 50 } }
                    }
                  },
                  Cheap: { obj: { dong: { cost: 1 } } }
                },
                resolveType: () => {}
              }
            }
          },
          SuperExpensive: {
            obj: { doot: { cost: 100 } }
          }
        }
      }),
      type: 'Root',
      query: {
        foo: {}, // 5
        bar: {}, // 10
        bar2: { _key: 'bar' }, // 10
        baz: { _arg: { size: 10 }, a: {}, b: {}, c: {} }, // 60
        oneOf: {
          _on_SuperExpensive: { doot: {} },
          _on_MediumExpensive: { ding: {} }
        }, // 100
        oneOf2: {
          _key: 'oneOf',
          _on_MediumExpensive: { ding: {} },
          _on_Cheap: { dong: {} }
        } // 50
      } // 235 * 3 = 705
    }),
    705
  );
};