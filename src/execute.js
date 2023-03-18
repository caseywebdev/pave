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
  let typeArgs;
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
      typeArgs,
      value,
      ...extra
    });

  if (!type) {
    if (value === undefined) return value;

    fail('unexpectedValue');
  }

  const validateQueue = [];
  const validate = value => {
    for (const { args, object, path, query, type } of validateQueue) {
      if (value == null) break;

      value = type.validate({
        args,
        context,
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
    if (isOptional && value === undefined) return undefined;

    if (isNullable && value == null) return null;

    if (!type) {
      if (value != null) return validate(value);

      fail(value === undefined ? 'expectedRequired' : 'expectedNonNull');
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

    if (type.constant !== undefined) {
      if (value === type.constant) return value;

      fail('expectedConstant');
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
      (object == null || type.arrayOf || type.oneOf || type.object) &&
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
      const onKey = `_on_${name}`;
      path = [...path, onKey];
      query = query[onKey] ?? {};
      continue;
    }

    if (type.object) {
      if (!Object.keys(type.object).length && type.defaultType) {
        return validate(
          Object.fromEntries(
            Object.keys(value).map(key => [
              key,
              validateValue({
                context,
                object: value,
                path: [...path, key],
                query,
                schema,
                type: type.defaultType,
                value: value[key]
              })
            ])
          )
        );
      }

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
                  context,
                  object: value,
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

    let args;
    if (query._args !== undefined) args = query._args;
    else if (type.args) {
      args = validateValue({
        context,
        path,
        query,
        schema,
        type: type.args,
        value: typeArgs
      });
    }

    if (type === validateQueue[0]?.type) validateQueue[0].args = args;

    if (type.resolve !== undefined) {
      if (typeof type.resolve === 'function') {
        value = await type.resolve({
          args,
          context,
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
    delete query._args;
    typeArgs = type.typeArgs;
    type = type.type;
  }
};

export default execute;
