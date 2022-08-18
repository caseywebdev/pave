import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';
import validateArgs from './validate-args.js';

const execute = async ({
  context,
  obj,
  path = [],
  query,
  schema,
  type,
  typeArgs,
  value
}) => {
  const fail = (code, extra) => {
    throw new PaveError(code, {
      context,
      obj,
      path,
      query,
      schema,
      type,
      typeArgs,
      value,
      ...extra
    });
  };

  let isNullable = false;
  let isOptional = false;
  let name = null;
  while (true) {
    if (type == null) {
      if (value != null) return value;

      if (!isOptional && isNullable) return null;

      if (value === undefined && !isOptional) fail('expectedRequired');

      if (value === null && !isNullable) fail('expectedNonNull');

      return value;
    }

    if (!isObject(type)) {
      if (!schema[type]) fail('unknownType');

      name = type;
      obj = null;
      type = schema[type];
      continue;
    }

    if (value === undefined && type.defaultValue !== undefined) {
      value = type.defaultValue;
      continue;
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
      (obj == null || type.arrayOf || type.oneOf || type.fields) &&
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

      return Promise.all(
        value.map((value, i) =>
          execute({
            context,
            obj,
            path: path.concat(i),
            query,
            schema,
            type: type.arrayOf,
            typeArgs,
            value
          })
        )
      );
    }

    if (type.oneOf) {
      name = type.resolveType(value);
      if (!(name in type.oneOf)) fail('expectedOneOfType');

      type = type.oneOf[name];
      const onKey = `_on_${name}`;
      path = path.concat(onKey);
      query = query[onKey] ?? {};
      continue;
    }

    if (type.fields) {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(query).map(async ([alias, query]) => {
            const { _field, ..._query } = query;
            const field = _field ?? alias;
            if (field === '_type') return [alias, name];

            return [
              alias,
              await execute({
                context,
                obj: value,
                path: path.concat(alias),
                query: _query,
                schema,
                type: type.fields[field],
                value: value[field]
              })
            ];
          })
        )
      );
    }

    query = { ...query };
    if ('resolve' in type) {
      if (isFunction(type.resolve)) {
        if (typeArgs) {
          query._args = validateArgs({
            args: typeArgs,
            context,
            path,
            query,
            schema,
            type
          });
        }

        value = await type.resolve({
          args: query._args,
          context,
          obj,
          path,
          query,
          schema,
          type,
          value
        });
      } else value = type.resolve;
    }

    delete query._args;
    typeArgs = type.typeArgs ?? {};
    type = type.type;
  }
};

export default execute;
