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
      let cost = 0;
      for (const name in type.oneOf) {
        const onKey = `_on_${name}`;
        cost = Math.max(
          cost,
          estimateCost({
            context,
            path: path.concat(onKey),
            query: query[onKey] ?? {},
            schema,
            type: type.oneOf[name]
          })
        );
      }
      return cost;
    }

    if (type.fields) {
      let cost = 0;
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
      return cost;
    }

    if (isFunction(type.cost)) {
      return type.cost({
        args: query._args,
        context,
        cost: estimateCost({ context, path, query, schema, type: type.type }),
        path,
        query,
        schema,
        type
      });
    }

    return type.cost || 0;
  }
};

export default estimateCost;
