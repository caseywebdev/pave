import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';
import validateArgs from './validate-args.js';

const execute = async ({
  args,
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
      args,
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
            args,
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
      const onKey = `_on${type.name}`;
      const _query = {};
      for (const [key, value] of Object.entries(ensureObject(query))) {
        if (key === onKey) Object.assign(_query, value);
        else if (!key.startsWith('_on')) _query[key] = value;
      }
      query = _query;
      return Object.fromEntries(
        await Promise.all(
          Object.entries(_query).map(async ([alias, query]) => {
            const { _args, _field, ..._query } = query;
            const field = _field || alias;
            let _type = type.fields[field];
            if (!_type) {
              if (field === '_type') _type = { resolve: type.name };
              else fail('unknownField', { alias, field });
            }

            return [
              alias,
              await execute({
                args: _args,
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
      let _value = 'resolve' in type ? type.resolve : value;
      if (isFunction(_value)) {
        _value = await _value({
          args: validateArgs({
            context,
            path: path.concat('_args'),
            schema,
            type,
            value: args
          }),
          context,
          obj,
          path,
          query,
          schema,
          type,
          value
        });
      }

      args = type.typeArgs;
      type = type.type;
      value = _value;
    }
  } while (true);
};

export default execute;
