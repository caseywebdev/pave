import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';
import validateArgs from './validate-args.js';

const execute = async ({
  context,
  obj,
  path = [],
  query,
  schema,
  type,
  value
}) => {
  const fail = (code, extra) => {
    throw new PaveError(code, {
      context,
      obj,
      path,
      query,
      schema,
      type,
      value,
      ...extra
    });
  };

  do {
    if (isFunction(value)) value = await value();
    else if (type == null) return value == null ? null : value;
    else if (!isObject(type)) {
      if (schema[type]) {
        obj = null;
        type = schema[type];
      } else fail('unknownType');
    } else if (value === undefined && type.defaultValue !== undefined) {
      value = type.defaultValue;
    } else if (type.nonNull) {
      if (value == null) fail('expectedNonNull');

      type = type.nonNull;
    } else if (type.arrayOf) {
      if (!isArray(value)) fail('expectedArray');

      return Promise.all(
        value.map((value, i) =>
          execute({
            context,
            obj,
            path: path[i],
            query,
            schema,
            type: type.arrayOf,
            value
          })
        )
      );
    } else if (type.oneOf) type = type.resolveType(value);
    else if (obj == null && value == null) return null;
    else if (type.fields) {
      const merged = {};
      const onKey = `_on${type.name}`;
      for (const key in query) {
        if (key === onKey) Object.assign(merged, query[key]);
        else if (!key.startsWith('_on')) merged[key] = query[key];
      }
      return Object.fromEntries(
        await Promise.all(
          Object.entries(merged).map(async ([alias, query]) => {
            const { _field, ..._query } = query;
            const field = _field || alias;
            let _type = type.fields[field];
            if (!_type) {
              if (field === '_type') _type = { resolve: type.name };
              else fail('unknownField', { alias, field });
            }

            return [
              alias,
              await execute({
                context,
                obj: value,
                path: path.concat(alias),
                query: _query,
                schema,
                type: _type,
                value: value[field]
              })
            ];
          })
        )
      );
    } else {
      const { _args, ..._query } = query;
      let _value = 'resolve' in type ? type.resolve : value;
      if (isFunction(_value)) {
        const args = validateArgs({
          context,
          path: path.concat('_args'),
          schema,
          type,
          value: _args
        });
        _value = await _value({ args, context, obj, query, value });
      }

      if (type.typeArgs) _query._args = type.typeArgs;
      query = _query;
      type = type.type;
      value = _value;
    }
  } while (true);
};

export default execute;
