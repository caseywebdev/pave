import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';
import validateArgs from './validate-args.js';

const execute = async o => {
  const { args, obj, path = [], query, schema, type, value } = o;

  if (isFunction(value)) return execute({ ...o, value: await value() });

  if (type == null) return value == null ? null : value;

  if (!isObject(type)) {
    const _type = schema[type];
    if (!_type) throw new PaveError('unknownType', o);

    return execute({ ...o, obj: null, type: _type });
  }

  if (value === undefined && type.defaultValue !== undefined) {
    return execute({ ...o, value: type.defaultValue });
  }

  if (type.nonNull) {
    if (value == null) throw new PaveError('expectedNonNull', o);

    return execute({ ...o, type: type.nonNull });
  }

  if (type.arrayOf) {
    if (!isArray(value)) throw new PaveError('expectedArray', o);

    return Promise.all(
      value.map(value => execute({ ...o, value, type: type.arrayOf }))
    );
  }

  if (type.oneOf) {
    const _type = await type.resolveType(value);
    const onKey = `_on${_type}`;
    const _query = {};
    for (const [key, value] of Object.entries(ensureObject(query))) {
      if (key === onKey) Object.assign(_query, value);
      else if (!key.startsWith('_on')) _query[key] = value;
    }
    return execute({ ...o, query: _query, type: _type });
  }

  if (obj == null && value == null) return null;

  if (type.fields) {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(ensureObject(query)).map(async ([alias, query]) => {
          const { _args, _field, ..._query } = query;
          const field = _field || alias;
          let _type = type.fields[field];
          if (!_type) {
            if (field === '_type') _type = { resolve: type.name };
            else throw new PaveError('unknownField', { ...o, alias, field });
          }

          return [
            alias,
            await execute({
              ...o,
              args: _args,
              obj: value,
              path: path.concat(alias),
              query: _query,
              type: _type,
              value: value[field]
            })
          ];
        })
      )
    );
  }

  let _value = 'resolve' in type ? type.resolve : value;
  if (isFunction(type.resolve)) {
    _value = await _value({
      ...o,
      args: validateArgs({
        ...o,
        path: path.concat('_args'),
        type: { defaultValue: {}, fields: type.args },
        value: args
      }),
      query: ensureObject(query)
    });
  }

  return execute({ ...o, args: type.typeArgs, type: type.type, value: _value });
};

export default execute;
