/** @import {Schema, Query, Type} from '#src/index.js'; */

import { isObject } from '#src/is-object.js';
import { throwPaveError } from '#src/throw-pave-error.js';
import { validateValue } from '#src/validate-value.js';

const { isArray } = Array;

const skipInput = {};

/**
 * @template {Schema<any>} S
 * @param {{
 *   context?: any;
 *   path?: string[];
 *   query: Query;
 *   schema: S;
 *   type: Type<S, any>;
 * }} options
 * @returns {Query}
 */
export const validateQuery = ({ context, path = [], query, schema, type }) => {
  const fail = (code, extra) =>
    throwPaveError(code, { context, path, query, schema, type, ...extra });

  while (true) {
    if (!isObject(query)) fail('invalidQuery');

    if (!type) {
      for (const alias in query) {
        if (query[alias] !== skipInput && alias !== '_type') {
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
        if (query[field] === skipInput) continue;

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
        if (query[alias] === skipInput) continue;

        if (alias === '_type') {
          query[alias] = {};
          continue;
        }

        const { _, ..._query } = { ...query[alias] };
        const field = _ ?? alias;
        const _type = type.object[field] ?? type.defaultType;
        if (!_type) fail('unknownField', { alias, field });

        query[alias] = {
          ...(alias !== field && { _ }),
          ...validateQuery({
            context,
            path: [...path, alias],
            query: _query,
            schema,
            type: _type
          })
        };
      }

      return query;
    }

    let { _, $, ..._query } = query;
    _query = validateQuery({
      context,
      path,
      query: { $: skipInput, ..._query },
      schema,
      type: type.type
    });

    if (_) _query._ = _;

    if ($ !== skipInput) {
      _query.$ = validateValue({
        context,
        path: [...path, '$'],
        query: _query,
        schema,
        type: type.input,
        value: $
      });
    }

    if (!type.input) delete _query.$;

    return _query;
  }
};
