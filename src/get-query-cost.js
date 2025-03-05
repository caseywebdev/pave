/** @import {Query, Schema, Type} from '#src/index.js'; */

import { isObject } from '#src/is-object.js';

const { isArray } = Array;

/**
 * @template [Context=any] Default is `any`
 * @param {{
 *   context?: Context;
 *   path?: string[];
 *   query: Query;
 *   schema: Schema<string, {}, any>;
 *   type: Type;
 * }} options
 */
export const getQueryCost = ({ context, path = [], query, schema, type }) => {
  let cost = 0;
  while (true) {
    if (!type) return cost;

    if (isArray(type)) type = { object: type };

    let nextType;
    if (!isObject(type)) nextType = schema[type];
    else if (type.optional) nextType = type.optional;
    else if (type.nullable) nextType = type.nullable;
    else if (type.arrayOf) nextType = type.arrayOf;
    else if (type.oneOf) {
      cost += Math.max(
        ...Object.entries(type.oneOf).map(([name, type]) => {
          const onField = `_on_${name}`;
          return getQueryCost({
            context,
            path: [...path, onField],
            query: query[onField] ?? {},
            schema,
            type
          });
        })
      );
    } else if (type.object) {
      for (const alias in query) {
        const _query = query[alias];
        const _type = type.object[_query._ ?? alias];
        cost += getQueryCost({
          context,
          path: [...path, alias],
          query: _query,
          schema,
          type: _type
        });
      }
    } else {
      cost += getQueryCost({ context, path, query, schema, type: type.type });
    }

    if (typeof type.cost === 'function') {
      return type.cost({
        context,
        cost,
        input: query.$,
        path,
        query,
        schema,
        type
      });
    } else if (type.cost) cost += type.cost;

    type = nextType;
  }
};
