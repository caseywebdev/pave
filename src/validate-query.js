import isObject from './is-object.js';
import throwPaveError from './throw-pave-error.js';
import validateValue from './validate-value.js';

const { isArray } = Array;

const skipArg = {};

const validateQuery = ({ ctx, path = [], query, schema, type }) => {
  const fail = (code, extra) =>
    throwPaveError(code, { ctx, path, query, schema, type, ...extra });

  while (true) {
    if (!isObject(query)) fail('invalidQuery');

    if (type == null) {
      for (const alias in query) {
        if (query[alias] !== skipArg && alias !== '_key' && alias !== '_type') {
          fail('unexpectedKey', {
            alias,
            key: query[alias]?._key || alias
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

    if (isArray(type)) type = { obj: type };

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
        if (alias === '_key' || query[alias] === skipArg) continue;

        const subQuery = { ...query[alias] };
        if (!isObject(subQuery)) fail('invalidQuery', { alias, key: alias });

        const key = subQuery._key ?? alias;
        if (key === '_type') {
          delete query[alias];
          continue;
        }

        if (alias === key) delete subQuery._key;

        const name = key.slice('_on_'.length);
        if (!type.oneOf[name]) fail('expectedOneOfTypeKey', { key: alias });

        query[alias] = validateQuery({
          ctx,
          path: [...path, alias],
          query: subQuery,
          schema,
          type: type.oneOf[name]
        });
      }

      return query;
    }

    if (type.obj) {
      query = { ...query };

      for (const alias in query) {
        if (alias === '_key' && path.length > 0) continue;

        if (query[alias] === skipArg) continue;

        if (!isObject(query[alias])) {
          fail('invalidQuery', {
            path: [...path, alias],
            query: query[alias]
          });
        }

        const subQuery = { ...query[alias] };
        const key = subQuery._key ?? alias;
        if (alias === key) delete subQuery._key;

        if (key === '_type') {
          query[alias] = {};
          continue;
        }

        const _type = type.obj[key];
        if (!_type) fail('unknownKey', { alias, key });

        query[alias] = validateQuery({
          ctx,
          path: [...path, alias],
          query: subQuery,
          schema,
          type: _type
        });
      }

      return query;
    }

    let { _arg, _key, ..._query } = query;
    _query = validateQuery({
      ctx,
      path,
      query: { _arg: skipArg, ..._query },
      schema,
      type: type.type
    });

    if (_key) _query._key = _key;

    if (_arg !== skipArg) {
      _query._arg = validateValue({
        ctx,
        path: [...path, '_arg'],
        query,
        schema,
        type: type.arg,
        value: query._arg
      });
    }

    if (!('arg' in type)) delete _query._arg;

    return _query;
  }
};

export default validateQuery;
