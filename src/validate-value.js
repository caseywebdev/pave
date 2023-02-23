import isObject from './is-object.js';
import throwPaveError from './throw-pave-error.js';

const { isArray } = Array;

const validateValue = ({
  ctx,
  obj,
  path = [],
  query,
  schema,
  type,
  typeArg,
  value
}) => {
  const fail = (code, extra) =>
    throwPaveError(code, {
      code,
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

  const validateTypes = [];
  const validate = value => {
    for (const type of validateTypes) {
      if (value == null) break;

      value = type.validate({ ctx, obj, path, query, schema, type, value });
    }
    return value;
  };

  let isNullable = false;
  let isOptional = false;
  while (true) {
    if (isOptional && value === undefined) return undefined;

    if (isNullable && value == null) return null;

    if (type == null) {
      if (value != null) return validate(value);

      fail(value === undefined ? 'expectedRequired' : 'expectedNonNull');
    }

    if (!isObject(type)) {
      if (!schema[type]) fail('unknownType');

      obj = null;
      type = schema[type];
      continue;
    }

    if (isArray(type)) type = { obj: type };

    if (value === undefined && type.defaultValue !== undefined) {
      value = type.defaultValue;
    }

    if (type.validate && type !== validateTypes[0]) validateTypes.unshift(type);

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

    if (value == null) {
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

      return validate(
        value.map((value, i) =>
          validateValue({
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
      );
    }

    if (type.oneOf) {
      const name = type.resolveType(value);
      if (!(name in type.oneOf)) fail('expectedOneOfType');

      type = type.oneOf[name];
      continue;
    }

    if (type.obj) {
      let check = {};
      for (const key in type.obj) check[key] = undefined;
      check = { ...check, ...value };
      const objIsArray = isArray(type.obj);
      const _value = objIsArray ? [] : {};
      obj = value;
      for (const key in check) {
        let value = check[key];
        const _type = type.obj[key];
        if (!_type) fail('unknownKey', { key });

        value = validateValue({
          ctx,
          obj,
          path: [...path, key],
          query,
          schema,
          type: _type,
          typeArg,
          value
        });
        if (objIsArray) _value.push(value);
        else if (value !== undefined) _value[key] = value;
      }
      return validate(_value);
    }

    if ('resolve' in type) {
      if (typeof type.resolve === 'function') {
        value = type.resolve({
          arg: validateValue({
            ctx,
            path: [...path, '_arg'],
            query,
            schema,
            type: type.arg,
            value: typeArg
          }),
          ctx,
          obj,
          path,
          query,
          schema,
          type,
          value
        });
      } else value = type.resolve;
    }

    typeArg = type.typeArg;
    type = type.type;
  }
};

export default validateValue;
