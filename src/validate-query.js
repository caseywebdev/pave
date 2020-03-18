import ensureObject from './ensure-object.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';
import validateArgs from './validate-args.js';

const validateQuery = ({ context, path = [], query, schema, type }) => {
  const fail = (code, extra) => {
    throw new PaveError(code, { context, path, query, schema, type, ...extra });
  };

  do {
    if (type == null) return {};
    else if (!isObject(type)) {
      if (schema[type]) type = schema[type];
      else fail('unknownType');
    } else if (type.nonNull) type = type.nonNull;
    else if (type.arrayOf) type = type.arrayOf;
    else if (type.oneOf) {
      const _query = {};
      for (const _type of type.oneOf) {
        _query[`_on${_type}`] = validateQuery({
          context,
          path,
          query,
          schema,
          type: _type
        });
      }
      return _query;
    } else if (type.fields) {
      let { _field, ..._query } = ensureObject(query);
      const merged = {};
      const onKey = `_on${type.name}`;
      for (const key in _query) {
        if (key === onKey) Object.assign(merged, query[key]);
        else if (!key.startsWith('_on')) merged[key] = query[key];
      }

      _query = {};
      if (_field) _query._field = _field;

      for (const alias in merged) {
        const { ...query } = ensureObject(merged[alias]);
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
        query: _query,
        schema,
        type: type.type
      });

      if (_field) _query._field = _field;

      _query._args = validateArgs({
        context,
        path,
        schema,
        type,
        value: _args
      });
      if (!type.args) delete _query._args;

      return _query;
    }
  } while (true);
};

export default validateQuery;
