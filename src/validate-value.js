import Context from './context.js';
import isObject from './is-object.js';
import throwPaveError from './throw-pave-error.js';

const { isArray } = Array;

const validateValue = ({
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

  const fail = (code, extra) =>
    throwPaveError(code, {
      code,
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
    for (const { context, input, object, path, query, type } of validateQueue) {
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

      object = null;
      type = schema[type];
      continue;
    }

    if (isArray(type)) type = { object: type };

    if (value === undefined && type.defaultValue !== undefined) {
      value = type.defaultValue;
    }

    if (type.validate && type !== validateQueue[0]?.type) {
      validateQueue.unshift({ context, object, path, query, type });
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

    if (value == null) {
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

      return validate(
        value.map((value, i) =>
          validateValue({
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
    }

    if (type.oneOf) {
      const name = type.resolveType(value);
      if (!type.oneOf[name]) fail('expectedOneOfType');

      type = type.oneOf[name];
      continue;
    }

    if (type.object) {
      if (!isObject(value)) fail('expectedObject');

      let check = {};
      for (const key in type.object) check[key] = undefined;
      check = { ...check, ...value };
      const objectIsArray = isArray(type.object);
      const _value = objectIsArray ? [] : {};
      const _object = value;
      for (const key in check) {
        const value = validateValue({
          context,
          object: _object,
          path: [...path, key],
          query,
          schema,
          type: type.object[key] ?? type.defaultType,
          value: check[key]
        });
        if (objectIsArray) _value.push(value);
        else if (value !== undefined) _value[key] = value;
      }
      return validate(_value);
    }

    const input = validateValue({
      context,
      path: [...path, '$'],
      query,
      schema,
      type: type.input,
      value: typeInput
    });

    if (type === validateQueue[0]?.type) validateQueue[0].input = input;

    if (type.resolve !== undefined) {
      if (typeof type.resolve === 'function') {
        value = type.resolve({
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

    typeInput = type.typeInput;
    type = type.type;
  }
};

export default validateValue;
