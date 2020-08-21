import ensureObject from './ensure-object.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';
import validateArgs from './validate-args.js';

const SKIP_ARGS = {};

const getTypes = type => {
  do {
    if (type == null) return {};
    else if (!isObject(type)) return { [type]: type };
    else if (type.optional) type = type.optional;
    else if (type.nullable) type = type.nullable;
    else if (type.arrayOf) type = type.arrayOf;
    else if (type.oneOf) {
      const types = {};
      for (const _type of type.oneOf) Object.assign(types, getTypes(_type));
      return types;
    } else if (type.name) return { [type.name]: type };
    else return {};
  } while (true);
};

const validateQuery = ({ context, path = [], query, schema, type }) => {
  const fail = (code, extra) => {
    throw new PaveError(code, { context, path, query, schema, type, ...extra });
  };

  do {
    if (type == null) return {};
    else if (!isObject(type)) {
      if (schema[type]) type = schema[type];
      else fail('unknownType');
    } else if (type.optional) type = type.optional;
    else if (type.nullable) type = type.nullable;
    else if (type.arrayOf) type = type.arrayOf;
    else if (type.oneOf) {
      const _query = {};
      const types = getTypes(type);
      for (const name in types) {
        _query[`_on_${name}`] = validateQuery({
          context,
          path,
          query,
          schema,
          type: types[name]
        });
      }
      return _query;
    } else if (type.fields) {
      let { _field, ..._query } = ensureObject(query);
      const merged = {};
      const onKey = `_on_${type.name}`;
      for (const key in _query) {
        if (key === onKey) Object.assign(merged, query[key]);
        else if (!key.startsWith('_on_')) merged[key] = query[key];
      }

      _query = {};
      if (_field) _query._field = _field;

      for (const alias in merged) {
        const query = ensureObject(merged[alias]);
        if (query === SKIP_ARGS) continue;

        const field = query._field || alias;
        let _type = type.fields[field];
        if (!_type) {
          if (field === '_type') _type = {};
          else fail('unknownField', { alias, field });
        }

        _query[alias] = validateQuery({
          context,
          path: path.concat(alias),
          query,
          schema,
          type: _type
        });
      }

      return _query;
    } else {
      let { _args, _field, ..._query } = ensureObject(query);
      _query = validateQuery({
        context,
        path,
        query: { _args: SKIP_ARGS, ..._query },
        schema,
        type: type.type
      });

      if (_field) _query._field = _field;

      if (_args !== SKIP_ARGS) {
        _query._args = validateArgs({
          context,
          path: path.concat('_args'),
          schema,
          type,
          value: _args
        });
      }

      if (!type.args) delete _query._args;

      return _query;
    }
  } while (true);
};

export default validateQuery;
