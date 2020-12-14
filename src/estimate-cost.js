import isFunction from './is-function.js';
import isObject from './is-object.js';

const estimateCost = ({ context, path = [], query, schema, type }) => {
  do {
    if (type == null) return 0;
    else if (!isObject(type)) type = schema[type];
    else if (type.optional) type = type.optional;
    else if (type.nullable) type = type.nullable;
    else if (type.arrayOf) type = type.arrayOf;
    else if (type.oneOf) {
      return Math.max(
        ...type.oneOf.map(type =>
          estimateCost({ context, path, query, schema, type })
        )
      );
    } else {
      // eslint-disable-next-line no-unused-vars
      const { _args, _field, ..._query } = query;
      let cost = 0;
      if (type.fields) {
        const merged = {};
        const onKey = `_on_${type.name}`;
        for (const key in query) {
          if (key === onKey) Object.assign(merged, query[key]);
          else if (!key.startsWith('_on_')) merged[key] = query[key];
        }
        for (const alias in merged) {
          const _query = merged[alias];
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
  } while (true);
};

export default estimateCost;
