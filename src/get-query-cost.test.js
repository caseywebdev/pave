import { strict as assert } from 'node:assert';

import { getQueryCost } from '#src/get-query-cost.js';
import { validateSchema } from '#src/validate-schema.js';

export default () => {
  assert.equal(
    getQueryCost({
      schema: validateSchema({
        schema: {
          Root: {
            cost: ({ cost }) => cost * 3,
            object: {
              foo: { cost: 5 },
              bar: { cost: 10 },
              baz: {
                input: { object: { size: {} } },
                cost: ({ input: { size }, cost, path }) => {
                  assert.deepEqual(path, ['baz']);
                  return size * cost;
                },
                type: {
                  object: { a: { cost: 1 }, b: { cost: 2 }, c: { cost: 3 } }
                }
              },
              oneOf: {
                oneOf: {
                  SuperExpensive: 'SuperExpensive',
                  MediumExpensive: {
                    nullable: { object: { ding: { cost: 50 } } }
                  },
                  Cheap: { object: { dong: { cost: 1 } } }
                },
                resolveType: () => {}
              }
            }
          },
          SuperExpensive: { object: { doot: { cost: 100 } } }
        }
      }),
      type: 'Root',
      query: {
        foo: {}, // 5
        bar: {}, // 10
        bar2: { _: 'bar' }, // 10
        baz: { $: { size: 10 }, a: {}, b: {}, c: {} }, // 60
        oneOf: {
          _on_SuperExpensive: { doot: {} },
          _on_MediumExpensive: { ding: {} }
        }, // 100
        oneOf2: {
          _: 'oneOf',
          _on_MediumExpensive: { ding: {} },
          _on_Cheap: { dong: {} }
        } // 50
      } // 235 * 3 = 705
    }),
    705
  );
};
