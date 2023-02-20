import isObject from './is-object.js';
import throwPaveError from './throw-pave-error.js';
import validateValue from './validate-value.js';

const { Promise } = globalThis;

const { isArray } = Array;

const execute = async ({
  ctx,
  isNullable = false,
  name = null,
  obj,
  path = [],
  query,
  schema,
  type,
  typeArg,
  value,
  isOptional = false
}) => {
  const fail = (code, extra) =>
    throwPaveError(code, {
      ctx,
      obj,
      path,
      query,
      schema,
      type,
      typeArg,
      value,
      ...extra
    });

  if (type === undefined) {
    if (value === undefined) return value;

    fail('unexpectedValue');
  }

  if (type === null) {
    if (value === null) return value;

    fail('expectedNull');
  }

  const validates = [];
  const validate = value => {
    for (const { obj, path, type, query } of validates) {
      if (value == null) break;

      value = type.validate({ ctx, obj, path, query, schema, type, value });
    }
    return value;
  };

  while (true) {
    if (isOptional && value === undefined) return undefined;

    if (isNullable && value == null) return null;

    if (type == null) {
      if (value != null) return validate(value);

      fail(value === undefined ? 'expectedRequired' : 'expectedNonNull');
    }

    if (!isObject(type)) {
      if (!schema[type]) fail('unknownType');

      name = type;
      obj = null;
      type = schema[type];
      continue;
    }

    if (isArray(type)) type = { object: type };

    if (type.validate && type !== validates[0]?.type) {
      validates.unshift({ type, obj, path, query });
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
      (obj == null || type.arrayOf || type.oneOf || type.object) &&
      value == null
    ) {
      type = null;
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

      return await validate(
        await Promise.all(
          value.map(
            async (value, i) =>
              await execute({
                ctx,
                obj,
                path: [...path, i],
                query,
                schema,
                type: type.arrayOf,
                typeArg,
                value
              })
          )
        )
      );
    }

    if (type.oneOf) {
      name = type.resolveType(value);
      if (!(name in type.oneOf)) fail('expectedOneOfType');

      type = type.oneOf[name];
      const onKey = `_on_${name}`;
      path = [...path, onKey];
      query = query[onKey] ?? {};
      continue;
    }

    if (type.object) {
      return await validate(
        Object.fromEntries(
          await Promise.all(
            Object.entries(query).map(async ([alias, query]) => {
              const { _key, ..._query } = query;
              const key = _key ?? alias;
              if (key === '_type') return [alias, name];

              return [
                alias,
                await execute({
                  ctx,
                  obj: value,
                  path: [...path, alias],
                  query: _query,
                  schema,
                  type: type.object[key],
                  value: value[key]
                })
              ];
            })
          )
        )
      );
    }

    if ('resolve' in type) {
      if (typeof type.resolve === 'function') {
        query = { ...query };
        if ('arg' in type && !('_arg' in query)) {
          query._arg = validateValue({
            ctx,
            path,
            query,
            schema,
            type: type.arg,
            value: typeArg
          });
        }

        value = await type.resolve({
          arg: query._arg,
          ctx,
          obj,
          path,
          query,
          schema,
          type,
          value
        });
        delete query._arg;
      } else value = type.resolve;
    }

    typeArg = type.typeArg;
    type = type.type;
  }
};

export default execute;
