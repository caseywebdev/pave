import isObject from './is-object.js';
import throwPaveError from './throw-pave-error.js';
import validateValue from './validate-value.js';

const { isArray } = Array;

const skipArgs = {};

const validateQuery = ({ context, path = [], query, schema, type }) => {
  const fail = (code, extra) =>
    throwPaveError(code, { context, path, query, schema, type, ...extra });

  while (true) {
    if (!isObject(query)) fail('invalidQuery');

    if (type == null) {
      for (const alias in query) {
        if (
          query[alias] !== skipArgs &&
          alias !== '_field' &&
          alias !== '_type'
        ) {
          fail('unexpectedField', {
            alias,
            field: query[alias]?._field || alias
          });
        }
      }

      return {};
    }

    if (!isObject(type)) {
      if (!schema[type]) fail('unknownType');

      type = schema[type];
      continue;
    }

    if (isArray(type)) type = { fields: type };

    if (type.optional) {
      type = type.optional;
      continue;
    }

    if (type.nullable) {
      type = type.nullable;
      continue;
    }

    if (type.arrayOf) {
      type = type.arrayOf;
      continue;
    }

    if (type.oneOf) {
      query = { ...query };

      for (const alias in query) {
        if (alias === '_field' || query[alias] === skipArgs) continue;

        const subQuery = { ...query[alias] };
        if (!isObject(subQuery)) fail('invalidQuery', { alias, key: alias });

        const key = subQuery._field ?? alias;
        if (key === '_type') {
          delete query[alias];
          continue;
        }

        if (alias === key) delete subQuery._field;

        const name = key.slice('_on_'.length);
        if (!type.oneOf[name]) fail('expectedOneOfTypeKey', { key: alias });

        query[alias] = validateQuery({
          context,
          path: [...path, alias],
          query: subQuery,
          schema,
          type: type.oneOf[name]
        });
      }

      return query;
    }

    if (type.fields) {
      query = { ...query };

      for (const alias in query) {
        if (alias === '_field' && path.length > 0) continue;

        if (query[alias] === skipArgs) continue;

        if (!isObject(query[alias])) {
          fail('invalidQuery', {
            path: [...path, alias],
            query: query[alias]
          });
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
          path: [...path, alias],
          query: subQuery,
          schema,
          type: _type
        });
      }

      return query;
    }

    let { _args, _field, ..._query } = query;
    _query = validateQuery({
      context,
      path,
      query: { _args: skipArgs, ..._query },
      schema,
      type: type.type
    });

    if (_field) _query._field = _field;

    if (_args !== skipArgs) {
      _query._args = validateValue({
        context,
        path: [...path, '_args'],
        query: _query,
        schema,
        type: type.args,
        value: _args
      });
    }

    if (!('args' in type)) delete _query._args;

    return _query;
  }
};

export default validateQuery;
