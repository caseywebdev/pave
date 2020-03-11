import argsToQuery from './args-to-query.js';
import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';
import mergeQueries from './merge-queries.js';
import PaveError from './pave-error.js';
import tagObjLiterals from './tag-obj-literals.js';
import typeToQuery from './type-to-query.js';

const execute = async o => {
  const { context, isDynamic, value, obj, path = [], schema, query, type } = o;

  if (type == null) return tagObjLiterals(value);

  if (isFunction(type)) {
    return execute({ ...o, isDynamic: true, type: await type(value) });
  }

  if (!isObject(type)) {
    const _type = schema[type];
    if (!_type) throw new PaveError(`Unknown type ${type} ${path.join('.')}`);

    return execute({ ...o, type: _type });
  }

  if (value === undefined && type.defaultValue !== undefined) {
    return execute({ ...o, value: type.defaultValue });
  }

  if (type.nonNull) {
    if (value == null) {
      throw new PaveError(`Expected non null value ${path.join('.')}`);
    }

    return execute({ ...o, type: type.nonNull });
  }

  if (type.arrayOf) {
    if (!isArray(value)) {
      throw new PaveError(`Expected an array value ${path.join('.')}`);
    }

    return Promise.all(
      value.map(value => execute({ ...o, value, type: type.arrayOf }))
    );
  }

  if (type.fields) {
    // eslint-disable-next-line no-unused-vars
    const { _args, _field, ..._query } = query || {};
    return Object.fromEntries(
      await Promise.all(
        Object.entries(_query).map(async ([alias, query]) => {
          const _field = query._field || alias;
          const _type = type.fields[_field];
          const _path = path.concat(alias);
          if (!_type && !isDynamic) {
            throw new PaveError(`Unknown field ${_path.join('.')}`);
          }

          const _value = value == null ? null : value[_field];
          return [
            alias,
            await execute({
              ...o,
              value: _value,
              obj: value,
              path: _path,
              query,
              type: _type
            })
          ];
        })
      )
    );
  }

  const { _args, ..._query } = ensureObject(query);
  let _value = 'resolve' in type ? type.resolve : value;
  if (typeof _value === 'function' && value == null) _value = null;
  if (typeof _value === 'function') {
    const argsType = { fields: type.args };
    _value = await _value({
      args: await execute({
        path: path.concat('_args'),
        query: mergeQueries(
          argsToQuery(_args),
          typeToQuery({ schema, type: argsType })
        ),
        schema,
        type: argsType,
        value: _args
      }),
      context,
      obj,
      path,
      query: _query,
      type,
      value
    });
  }

  return execute({
    ...o,
    context,
    isDynamic: false,
    query: { _args: type.typeArgs, ..._query },
    type: type.type,
    value: _value
  });
};

export default execute;
