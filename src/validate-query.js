import ensureObject from './ensure-object.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';
import validateArgs from './validate-args.js';

const validateQuery = ({ context, path = [], query, schema, type }) => {
  const fail = (code, extra) => {
    throw new PaveError(code, { context, path, query, schema, type, ...extra });
  };

  do {
    if (type == null) type = { fields: {} };
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
      let { _field, ..._query } = query;
      const onKey = `_on${type.name}`;
      const flattened = {};
      for (const [key, value] of Object.entries(ensureObject(_query))) {
        if (key === onKey) Object.assign(flattened, value);
        else if (!key.startsWith('_on')) flattened[key] = value;
      }

      _query = {};

      for (let [alias, query] of Object.entries(flattened)) {
        query = ensureObject(query);
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

      if (_field) _query._field = _field;

      return _query;
    } else {
      const { _args, _field, ...rest } = query;
      const _query = validateQuery({
        context,
        path,
        query: rest,
        schema,
        type: type.type
      });

      if (_args || type.args) {
        const args = validateArgs({
          context,
          path,
          schema,
          type,
          value: query._args
        });

        if (type.args) _query._args = args;
      }

      if (_field) _query._field = _field;

      return _query;
    }
  } while (true);
};

export default validateQuery;
