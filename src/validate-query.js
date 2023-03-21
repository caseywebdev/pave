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

    if (!type) {
      for (const alias in query) {
        if (query[alias] !== skipArgs && alias !== '_type') {
          fail('unexpectedField', { field: alias });
        }
      }

      return {};
    }

    if (!isObject(type)) {
      if (!schema[type]) fail('unknownType');

      type = schema[type];
      continue;
    }

    if (isArray(type)) type = { object: type };

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

      for (const field in query) {
        if (query[field] === skipArgs) continue;

        if (field === '_type') {
          delete query._type;
          continue;
        }

        const name = field.slice('_on_'.length);
        if (!field.startsWith('_on_') || !type.oneOf[name]) {
          fail('expectedOneOfTypeField', { field });
        }

        query[field] = validateQuery({
          context,
          path: [...path, field],
          query: query[field],
          schema,
          type: type.oneOf[name]
        });
      }

      return query;
    }

    if (type.object) {
      query = { ...query };

      for (const alias in query) {
        if (query[alias] === skipArgs) continue;

        if (alias === '_type') {
          query[alias] = {};
          continue;
        }

        const { _field, ..._query } = { ...query[alias] };
        const field = _field ?? alias;
        if (!type.object[field]) fail('unknownField', { alias, field });

        query[alias] = {
          ...(alias !== field && { _field }),
          ...validateQuery({
            context,
            path: [...path, alias],
            query: _query,
            schema,
            type: type.object[field]
          })
        };
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

    if (!type.args) delete _query._args;

    return _query;
  }
};

export default validateQuery;
