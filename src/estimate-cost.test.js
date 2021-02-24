import { strict as assert } from 'assert';

import estimateCost from './estimate-cost.js';

export default () => {
  assert.equal(
    estimateCost({
      schema: {
        Root: {
          cost: ({ cost }) => cost * 3,
          fields: {
            foo: {
              cost: 5
            },
            bar: { cost: 10 },
            baz: {
              args: { size: {} },
              cost: ({ args: { size }, cost, path }) => {
                assert.deepEqual(path, ['baz']);
                return size * cost;
              },
              type: {
                fields: {
                  a: { cost: 1 },
                  b: { cost: 2 },
                  c: { cost: 3 }
                }
              }
            },
            oneOf: {
              oneOf: [
                'SuperExpensive',
                {
                  name: 'MediumExpensive',
                  nullable: {
                    fields: { ding: { cost: 50 } }
                  }
                },
                { name: 'Cheap', fields: { dong: { cost: 1 } } }
              ]
            }
          }
        },
        SuperExpensive: {
          fields: { doot: { cost: 100 } }
        }
      },
      type: 'Root',
      query: {
        foo: {}, // 5
        bar: {}, // 10
        bar2: { _field: 'bar' }, // 10
        baz: { _args: { size: 10 }, a: {}, b: {}, c: {} }, // 60
        oneOf: {
          _on_SuperExpensive: { doot: {} },
          _on_MediumExpensive: { ding: {} }
        }, // 100
        oneOf2: {
          _field: 'oneOf',
          _on_MediumExpensive: { ding: {} },
          _on_Cheap: { dong: {} }
        } // 50
      } // 235 * 3 = 705
    }),
    705
  );
};
