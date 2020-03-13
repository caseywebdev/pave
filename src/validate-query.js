import ensureObject from './ensure-object.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';
import validateArgs from './validate-args.js';

const validateQuery = ({ context, path = [], query, schema, type }) => {
  const fail = (code, extra) => {
    throw new PaveError(code, {
      context,
      path,
      query,
      schema,
      type,
      ...extra
    });
  };

  do {
    if (type == null) return query;
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
      const onKey = `_on${type.name}`;
      const _query = {};
      for (const [key, value] of Object.entries(ensureObject(query))) {
        if (key === onKey) Object.assign(_query, value);
        else if (!key.startsWith('_on')) _query[key] = value;
      }
      for (const alias in _query) {
        if (alias === '_args' || alias === '_field') continue;

        const field = _query[alias]._field || alias;
        let _type = type.fields[field];
        if (!_type) {
          if (field === '_type') _type = {};
          else fail('unknownField', { alias, field });
        }
        _query[field] = validateQuery({
          context,
          path: path.concat(field),
          query: _query[alias],
          schema,
          type: _type
        });
      }
      return _query;
    } else {
      let { _args, _field, ..._query } = ensureObject(query);
      if (_args || type.args) {
        _args = validateArgs({
          context,
          path: path.concat('_args'),
          query,
          schema,
          type,
          value: _args
        });
        if (type.args) _query._args = _args;
      }
      if (_field) _query._field = _field;

      return _query;
    }
  } while (true);
};

export default validateQuery;
