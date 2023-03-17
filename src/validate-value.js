import isObject from './is-object.js';
import throwPaveError from './throw-pave-error.js';

const { isArray } = Array;

const validateValue = ({
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

  const fail = (code, extra) =>
    throwPaveError(code, {
      code,
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
    for (const { args, type } of validateQueue) {
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

      parent = null;
      type = schema[type];
      continue;
    }

    if (isArray(type)) type = { fields: type };

    if (value === undefined && type.defaultValue !== undefined) {
      value = type.defaultValue;
    }

    if (type.validate && type !== validateQueue[0]?.type) {
      validateQueue.unshift({ type });
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
            context,
            parent,
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
      if (!(name in type.oneOf)) fail('expectedOneOfType');

      type = type.oneOf[name];
      continue;
    }

    if (type.fields) {
      let check = {};
      for (const field in type.fields) check[field] = undefined;
      check = { ...check, ...value };
      const fieldsIsArray = isArray(type.fields);
      const _value = fieldsIsArray ? [] : {};
      const _parent = value;
      for (const field in check) {
        let value = check[field];
        const _type = type.fields[field];
        if (!_type) fail('unknownField', { field });

        value = validateValue({
          context,
          parent: _parent,
          path: [...path, field],
          query,
          schema,
          type: _type,
          value
        });
        if (fieldsIsArray) _value.push(value);
        else if (value !== undefined) _value[field] = value;
      }
      return validate(_value);
    }

    const args = validateValue({
      context,
      path: [...path, '_args'],
      query,
      schema,
      type: type.args,
      value: typeArgs
    });

    if (type === validateQueue[0]?.type) validateQueue[0].args = args;

    if ('resolve' in type) {
      if (typeof type.resolve === 'function') {
        value = type.resolve({
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

    typeArgs = type.typeArgs;
    type = type.type;
  }
};

export default validateValue;
