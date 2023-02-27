import isObject from './is-object.js';

const { isArray } = Array;

const getQueryCost = ({ ctx, path = [], query, schema, type }) => {
  let cost = 0;
  while (true) {
    if (type == null) return cost;

    if (isArray(type)) type = { obj: type };

    let nextType;
    if (!isObject(type)) nextType = schema[type];
    else if (type.optional) nextType = type.optional;
    else if (type.nullable) nextType = type.nullable;
    else if (type.arrayOf) nextType = type.arrayOf;
    else if (type.oneOf) {
      cost += Math.max(
        ...Object.entries(type.oneOf).map(([name, type]) => {
          const onKey = `_on_${name}`;
          return getQueryCost({
            ctx,
            path: [...path, onKey],
            query: query[onKey] ?? {},
            schema,
            type
          });
        })
      );
    } else if (type.obj) {
      for (const alias in query) {
        const _query = query[alias];
        const _type = type.obj[_query._ ?? alias];
        cost += getQueryCost({
          ctx,
          path: [...path, alias],
          query: _query,
          schema,
          type: _type
        });
      }
    } else {
      cost += getQueryCost({ ctx, path, query, schema, type: type.type });
    }

    if (typeof type.cost === 'function') {
      return type.cost({
        $: query.$,
        ctx,
        cost,
        path,
        query,
        schema,
        type
      });
    } else if (type.cost) cost += type.cost;

    type = nextType;
  }
};

export default getQueryCost;
