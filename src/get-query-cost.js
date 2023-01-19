import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';

const getQueryCost = ({ context, path = [], query, schema, type }) => {
  let cost = 0;
  while (true) {
    if (type == null) return cost;

    if (isArray(type)) type = { fields: type };

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
            context,
            path: path.concat(onKey),
            query: query[onKey] ?? {},
            schema,
            type
          });
        })
      );
    } else if (type.fields) {
      for (const alias in query) {
        const _query = query[alias];
        const _type = type.fields[_query._field ?? alias];
        cost += getQueryCost({
          context,
          path: path.concat(alias),
          query: _query,
          schema,
          type: _type
        });
      }
    } else {
      cost += getQueryCost({ context, path, query, schema, type: type.type });
    }

    if (isFunction(type.cost)) {
      return type.cost({
        args: query._args,
        context,
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
