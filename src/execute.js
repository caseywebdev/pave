/** @import {Query, Schema, Type} from '#src/index.js'; */

import { Context } from '#src/context.js';
import { isObject } from '#src/is-object.js';
import { throwPaveError } from '#src/throw-pave-error.js';
import { validateValue } from '#src/validate-value.js';

const { Promise } = globalThis;

const { isArray } = Array;

/**
 * @template {Schema<any, any, any>} S
 * @param {{
 *   context?: any;
 *   object?: any;
 *   path?: string[];
 *   query: Query;
 *   schema: S;
 *   type: Type<S>;
 *   value?: any;
 * }} options
 */
export const execute = async ({
  context,
  object,
  path = [],
  query,
  schema,
  type,
  value
}) => {
  /** @type {any} */
  let typeInput;

  /**
   * @param {Parameters<typeof throwPaveError>[0]} code
   * @param {{ [K: string]: any }} [extra]
   */
  const fail = (code, extra) =>
    throwPaveError(code, {
      context,
      object,
      path,
      query,
      schema,
      type,
      typeInput,
      value,
      ...extra
    });

  if (!type) {
    if (value === undefined) return value;

    fail('unexpectedValue');
  }

  let isNullable = false;
  let isOptional = false;
  /** @type {string | null} */
  let name = null;
  /**
   * @type {{
   *       context: any;
   *       input: any;
   *       object: any;
   *       path: string[];
   *       query: Query;
   *       type: Type;
   *     }[]
   *   | undefined}
   */
  let validateQueue;

  while (true) {
    if (!type) {
      if (validateQueue && value != null) {
        for (const {
          context,
          input,
          object,
          path,
          query,
          type
        } of validateQueue) {
          value = type.validate({
            context,
            input,
            object,
            path,
            query,
            schema,
            type,
            value
          });

          if (value == null) break;
        }
      }

      if (value != null) return value;

      if (isOptional && value === undefined) return undefined;

      if (isNullable) return null;

      fail('expectedNonNull');
    }

    if (!isObject(type)) {
      if (!schema[type]) fail('unknownType');

      name = type;
      object = null;
      type = schema[type];
      continue;
    }

    if (isArray(type)) type = { object: type };

    if (type.validate && type !== validateQueue?.[0].type) {
      (validateQueue ??= []).unshift({ context, object, path, query, type });
    }

    if (value === undefined && type.defaultValue !== undefined) {
      value = type.defaultValue;
    }

    if (type.optional) {
      type = type.optional;
      isOptional = true;
      continue;
    }

    if (type.nullable) {
      type = type.nullable;
      isNullable = true;
      continue;
    }

    if (
      value == null &&
      (type.arrayOf || type.oneOf || type.object || object == null)
    ) {
      type = undefined;
      continue;
    }

    if (type.arrayOf) {
      if (!isArray(value)) fail('expectedArray');

      const { minLength, maxLength } = type;
      if (minLength != null && value.length < minLength) {
        fail('expectedArrayMinLength');
      }

      if (maxLength != null && value.length > maxLength) {
        fail('expectedArrayMaxLength');
      }

      value = await Promise.all(
        value.map(
          async (value, i) =>
            await execute({
              context,
              object,
              path: [...path, i],
              query,
              schema,
              type: type.arrayOf,
              value
            })
        )
      );
      type = undefined;
      continue;
    }

    if (type.oneOf) {
      name = type.resolveType(value);
      if (!type.oneOf[name]) fail('expectedOneOfType');

      type = type.oneOf[name];
      const onField = `_on_${name}`;
      path = [...path, onField];
      query = query[onField] ?? {};
      continue;
    }

    if (type.object) {
      if (
        type.defaultType &&
        Object.entries(query).every(
          ([alias, { _ }]) => (_ ?? alias) === '_type'
        )
      ) {
        query = { ...query };
        for (const key in value) query[key] ??= {};
      }

      value = Object.fromEntries(
        await Promise.all(
          Object.entries(query).map(async ([alias, query]) => {
            const { _, ..._query } = query;
            const field = _ ?? alias;
            if (field === '_type') return [alias, name];

            return [
              alias,
              await execute({
                context,
                object: value,
                path: [...path, alias],
                query: _query,
                schema,
                type: type.object[field] ?? type.defaultType,
                value: value[field]
              })
            ];
          })
        )
      );
      type = undefined;
      continue;
    }

    let input;
    if (query.$ !== undefined) input = query.$;
    else if (type.input) {
      input = validateValue({
        context,
        path,
        query,
        schema,
        type: type.input,
        value: typeInput
      });
    }

    if (type === validateQueue?.[0].type) validateQueue[0].input = input;

    if (type.resolve !== undefined) {
      if (typeof type.resolve === 'function') {
        value = await type.resolve({
          context,
          input,
          object,
          path,
          query,
          schema,
          type,
          value
        });
        if (value instanceof Context) ({ context, value } = value);
      } else value = type.resolve;
    }

    query = { ...query };
    delete query.$;
    typeInput = type.typeInput;
    type = type.type;
  }
};
