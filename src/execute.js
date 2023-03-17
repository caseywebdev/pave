import isObject from './is-object.js';
import throwPaveError from './throw-pave-error.js';
import validateValue from './validate-value.js';

const { Promise } = globalThis;

const { isArray } = Array;

const execute = async ({
  context,
  parent,
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
      parent,
      path,
      query,
      schema,
      type,
      typeArgs,
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

  const validateQueue = [];
  const validate = value => {
    for (const { args, parent, path, query, type } of validateQueue) {
      if (value == null) break;

      value = type.validate({
        args,
        context,
        parent,
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

    if (type == null) {
      if (value != null) return validate(value);

      fail(value === undefined ? 'expectedRequired' : 'expectedNonNull');
    }

    if (!isObject(type)) {
      if (!schema[type]) fail('unknownType');

      name = type;
      parent = null;
      type = schema[type];
      continue;
    }

    if (isArray(type)) type = { fields: type };

    if (type.validate && type !== validateQueue[0]?.type) {
      validateQueue.unshift({ parent, path, query, type });
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
      (parent == null || type.arrayOf || type.oneOf || type.fields) &&
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
                parent,
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
      if (!(name in type.oneOf)) fail('expectedOneOfType');

      type = type.oneOf[name];
      const onField = `_on_${name}`;
      path = [...path, onField];
      query = query[onField] ?? {};
      continue;
    }

    if (type.fields) {
      return await validate(
        Object.fromEntries(
          await Promise.all(
            Object.entries(query).map(async ([alias, query]) => {
              const { _field, ..._query } = query;
              const field = _field ?? alias;
              if (field === '_type') return [alias, name];

              return [
                alias,
                await execute({
                  context,
                  parent: value,
                  path: [...path, alias],
                  query: _query,
                  schema,
                  type: type.fields[field],
                  value: value[field]
                })
              ];
            })
          )
        )
      );
    }

    let args;
    if ('_args' in query) args = query._args;
    else if ('args' in type) {
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

    if ('resolve' in type) {
      if (typeof type.resolve === 'function') {
        value = await type.resolve({
          args,
          context,
          parent,
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
