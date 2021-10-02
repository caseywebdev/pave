import isFunction from './is-function.js';
import isObject from './is-object.js';

const estimateCost = ({ context, path = [], query, schema, type }) => {
  while (true) {
    if (type == null) return 0;

    if (!isObject(type)) {
      type = schema[type];
      continue;
    }

    if (type.optional) {
      type = type.optional;
      continue;
    }

    if (type.nullable) {
      type = type.nullable;
      continue;
    }

    if (type.arrayOf) {
      type = type.arrayOf;
      continue;
    }

    if (type.oneOf) {
      return Math.max(
        ...Object.entries(type.oneOf).map(([name, type]) => {
          const onKey = `_on_${name}`;
          return estimateCost({
            context,
            path: path.concat(onKey),
            query: query[onKey] ?? {},
            schema,
            type
          });
        })
      );
    }

    // eslint-disable-next-line no-unused-vars
    const { _args, _field, ..._query } = query;
    let cost = 0;
    if (type.fields) {
      for (const alias in query) {
        const _query = query[alias];
        const _type = type.fields[_query._field ?? alias];
        cost += estimateCost({
          context,
          path: path.concat(alias),
          query: _query,
          schema,
          type: _type
        });
      }
    } else {
      cost = estimateCost({
        context,
        path,
        query: _query,
        schema,
        type: type.type
      });
    }

    if (isFunction(type.cost)) {
      cost = type.cost({
        args: _args,
        context,
        cost,
        path,
        query,
        schema,
        type
      });
    } else if (type.cost) cost += type.cost;

    return cost;
  }
};

export default estimateCost;
