import getTypes from './get-types.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';
import validateArgs from './validate-args.js';

const SKIP_ARGS = {};

const validateQuery = ({ context, path = [], query, schema, type }) => {
  const fail = (code, extra) => {
    throw new PaveError(code, { context, path, query, schema, type, ...extra });
  };

  do {
    if (!isObject(query)) fail('invalidQuery');

    if (type == null) {
      for (const alias in query) {
        if (
          alias !== '_args' &&
          alias !== '_field' &&
          alias !== '_type' &&
          !alias.startsWith('_on_')
        ) {
          fail('unknownField', { alias, field: query[alias]?._field || alias });
        }
      }

      return {};
    } else if (!isObject(type)) {
      if (schema[type]) type = schema[type];
      else fail('unknownType');
    } else if (type.optional) type = type.optional;
    else if (type.nullable) type = type.nullable;
    else if (type.arrayOf) type = type.arrayOf;
    else if (type.oneOf) {
      query = { ...query };
      const types = getTypes(type);

      for (const alias in query) {
        if (alias === '_field' || query[alias] === SKIP_ARGS) continue;

        const subQuery = { ...query[alias] };
        if (!isObject(subQuery)) fail('invalidQuery', { alias, field: alias });

        const field = subQuery._field ?? alias;
        if (field == '_type') {
          delete query[alias];
          continue;
        }

        if (alias === field) delete subQuery._field;

        if (!field.startsWith('_on_')) {
          fail('ambiguousField', { alias, field: alias });
        }

        const name = field.slice('_on_'.length);
        query[alias] = validateQuery({
          context,
          path: path.concat(alias),
          query: subQuery,
          schema,
          type: types[name]
        });
      }

      return query;
    } else if (type.fields) {
      query = { ...query };

      for (const alias in query) {
        if (alias === '_field' || query[alias] === SKIP_ARGS) continue;

        if (!isObject(query[alias])) {
          fail('invalidQuery', { alias, field: alias });
        }

        const subQuery = { ...query[alias] };
        const field = subQuery._field ?? alias;
        if (alias === field) delete subQuery._field;

        if (field === '_type') {
          query[alias] = {};
          continue;
        }

        const _type = type.fields[field];
        if (!_type) fail('unknownField', { alias, field });

        query[alias] = validateQuery({
          context,
          path: path.concat(alias),
          query: subQuery,
          schema,
          type: _type
        });
      }

      return query;
    } else {
      let { _args, _field, ..._query } = query;
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
          args: _args,
          context,
          path: path.concat('_args'),
          query: { ..._query, _args },
          schema,
          type
        });
      }

      if (!type.args) delete _query._args;

      return _query;
    }
  } while (true);
};

export default validateQuery;
