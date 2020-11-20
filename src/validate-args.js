import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';

const _validateArgs = ({
  args,
  context,
  path = [],
  query,
  schema,
  type,
  value
}) => {
  const fail = (code, extra) => {
    throw new PaveError(code, {
      args,
      context,
      path,
      query,
      schema,
      type,
      value,
      ...extra
    });
  };

  let isNullable = false;
  let isOptional = false;
  do {
    if (type == null) {
      if (value != null) return value;

      if (!isOptional && isNullable) return null;

      if (value === undefined && !isOptional) fail('expectedRequired');

      if (value === null && !isNullable) fail('expectedNonNull');

      return value;
    } else if (!isObject(type)) {
      if (schema[type]) type = schema[type];
      else fail('unknownType');
    } else if (value === undefined && type.defaultValue !== undefined) {
      value = type.defaultValue;
    } else if (type.optional) {
      type = type.optional;
      isOptional = true;
    } else if (type.nullable) {
      type = type.nullable;
      isNullable = true;
    } else if (value == null) type = null;
    else if (type.arrayOf) {
      if (!isArray(value)) fail('expectedArray');

      const { minLength, maxLength } = type;
      if (minLength != null && value.length < minLength) {
        fail('expectedArrayMinLength');
      }

      if (maxLength != null && value.length > maxLength) {
        fail('expectedArrayMaxLength');
      }

      return value.map((value, i) =>
        _validateArgs({
          args,
          context,
          path: path.concat(i),
          schema,
          query,
          type: type.arrayOf,
          value
        })
      );
    } else if (type.oneOf) type = type.resolveType(value);
    else if (type.fields) {
      let check = {};
      for (const field in type.fields) check[field] = undefined;
      check = { ...check, ...value };
      const _value = {};
      for (const field in check) {
        let value = check[field];
        const _type = type.fields[field];
        if (!_type) fail('unknownField', { field });

        value = _validateArgs({
          args,
          context,
          path: path.concat(field),
          query,
          schema,
          type: _type,
          value
        });
        if (value !== undefined) _value[field] = value;
      }
      return _value;
    } else {
      let _value = 'resolve' in type ? type.resolve : value;
      if (isFunction(_value)) {
        _value = _value({
          args: validateArgs({
            args: type.args,
            context,
            path: path.concat('_args'),
            query,
            schema,
            validate: type.validate,
            value: args
          }),
          context,
          path,
          query,
          schema,
          value
        });
      }

      args = type.typeArgs;
      type = type.type;
      value = _value;
    }
  } while (true);
};

const validateArgs = ({
  args,
  context,
  path,
  query,
  schema,
  validate,
  value
}) => {
  args = _validateArgs({
    context,
    path,
    query,
    schema,
    type: { defaultValue: {}, fields: args },
    value
  });
  return validate ? validate({ args, context, path, schema, query }) : args;
};

export default validateArgs;
