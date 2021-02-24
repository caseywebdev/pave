import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';

const validateValue = ({
  context,
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
        validateValue({
          context,
          path: path.concat(i),
          query,
          schema,
          type: type.arrayOf,
          typeArgs,
          value
        })
      );
    } else if (type.oneOf) type = type.oneOf[type.resolveType(value)];
    else if (type.fields) {
      let check = {};
      for (const field in type.fields) check[field] = undefined;
      check = { ...check, ...value };
      const _value = {};
      for (const field in check) {
        let value = check[field];
        const _type = type.fields[field];
        if (!_type) fail('unknownField', { field });

        value = validateValue({
          context,
          path: path.concat(field),
          query,
          schema,
          type: _type,
          typeArgs,
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
            args: typeArgs,
            context,
            path: path.concat('_args'),
            query,
            schema,
            type
          }),
          context,
          path,
          query,
          schema,
          type,
          value
        });
      }

      typeArgs = type.typeArgs;
      type = type.type;
      value = _value;
    }
  } while (true);
};

const validateArgs = ({ args, context, path, query, schema, type }) => {
  args = validateValue({
    context,
    path,
    query,
    schema,
    type: { defaultValue: {}, fields: type.args ?? {} },
    value: args
  });

  if (!type.validate) return args;

  return type.validate({
    args,
    context,
    path,
    query: { ...query, _args: args },
    schema,
    type
  });
};

export default validateArgs;
