/** @import {Schema, Query, SchemaContext, Type} from '#src/index.js'; */

import { isObject } from '#src/is-object.js';

const { isArray } = Array;

/**
 * @param {{
 *   context?: any;
 *   path?: string[];
 *   query: Query;
 *   schema: Schema<any>;
 *   type: Type<any>;
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
        ...Object.entries(query).map(([alias, _query]) =>
          alias.startsWith('_on_')
            ? getQueryCost({
                context,
                path: [...path, alias],
                query: _query,
                schema,
                type: type.oneOf[alias.slice(4)]
              })
            : 0
        )
      );
    } else if (type.object) {
      for (const alias in query) {
        if (alias === '$' || alias === '_') continue;

        const _query = query[alias];
        const _type = type.object[_query._ ?? alias] ?? type.defaultType;
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
