import isObject from './is-object.js';
import throwPaveError from './throw-pave-error.js';
import validateValue from './validate-value.js';

const { Promise } = globalThis;

const { isArray } = Array;

const execute = async ({
  context,
  object,
  path = [],
  query,
  schema,
  type,
  value
}) => {
  let typeInput;
  let isNullable = false;
  let isOptional = false;
  let name = null;

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

  const validateQueue = [];
  const validate = value => {
    for (const { input, object, path, query, type } of validateQueue) {
      if (value == null) break;

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
    }
    return value;
  };

  while (true) {
    if (!type) {
      if (value != null) return validate(value);

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

    if (type.validate && type !== validateQueue[0]?.type) {
      validateQueue.unshift({ object, path, query, type });
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

      return await validate(
        await Promise.all(
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
        )
      );
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

      return await validate(
        Object.fromEntries(
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
        )
      );
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

    if (type === validateQueue[0]?.type) validateQueue[0].input = input;

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
      } else value = type.resolve;
    }

    query = { ...query };
    delete query.$;
    typeInput = type.typeInput;
    type = type.type;
  }
};

export default execute;
