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
  const { context, obj, path = [], query, schema, type, value } = o;

  if (isFunction(value)) return execute({ ...o, value: await value() });

  if (type == null) return tagObjLiterals(value);

  if (!isObject(type)) {
    const _type = schema[type];
    if (!_type) throw new PaveError(`Unknown type ${type} ${path.join('.')}`);

    return execute({ ...o, obj: null, type: _type });
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

  if (type.oneOf) {
    const _type = type.resolveType(value);
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
    // eslint-disable-next-line no-unused-vars
    const { _args, _field, ..._query } = ensureObject(query);
    return Object.fromEntries(
      await Promise.all(
        Object.entries(_query).map(async ([alias, query]) => {
          const _field = query._field || alias;
          let _type = type.fields[_field];
          const _path = path.concat(alias);
          if (!_type) {
            if (_field === '_type') _type = { resolve: type.name };
            else {
              throw new PaveError(
                `Unknown field ${_field} at ${_path.join('.')}`
              );
            }
          }

          return [
            alias,
            await execute({
              ...o,
              value: value[_field],
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
  if (isFunction(_value)) {
    const argsType = { defaultValue: {}, fields: type.args };
    const args = await execute({
      ...o,
      path: path.concat('_args'),
      query: mergeQueries(
        argsToQuery(_args),
        typeToQuery({ schema, type: argsType })
      ),
      type: argsType,
      value: _args
    });
    _value = await _value({ ...o, args, query: _query });
  }

  return execute({
    ...o,
    context,
    query: { _args: type.typeArgs, ..._query },
    type: type.type,
    value: _value
  });
};

export default execute;
