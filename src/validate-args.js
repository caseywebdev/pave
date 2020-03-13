import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';

const _validateArgs = ({ args, context, path = [], schema, type, value }) => {
  const fail = (code, extra) => {
    throw new PaveError(code, {
      args,
      context,
      path,
      schema,
      type,
      value,
      ...extra
    });
  };

  do {
    if (type == null) return value;
    else if (!isObject(type)) {
      if (schema[type]) type = schema[type];
      else fail('unknownType');
    } else if (value === undefined && type.defaultValue !== undefined) {
      value = type.defaultValue;
    } else if (type.nonNull) {
      if (value == null) fail('expectedNonNull');

      type = type.nonNull;
    } else if (type.arrayOf) {
      if (!isArray(value)) fail('expectedArray');

      return value.map((value, i) =>
        _validateArgs({
          args,
          context,
          path: path.concat(i),
          schema,
          type: type.arrayOf,
          value
        })
      );
    } else if (type.oneOf) type = type.resolveType(value);
    else if (value == null) return null;
    else if (type.fields) {
      let _value = {};
      for (const field in type.fields) _value[field] = undefined;
      _value = { ..._value, ...value };
      for (const field in _value) {
        const value = _value[field];
        const _type = type.fields[field];
        if (!_type) fail('unknownField', { field });

        _value[field] = _validateArgs({
          args,
          context,
          path: path.concat(field),
          schema,
          type: _type,
          value
        });
      }
      return _value;
    } else {
      let _value = 'resolve' in type ? type.resolve : value;
      if (isFunction(_value)) {
        _value = _value({
          args: validateArgs({
            context,
            path: path.concat('_args'),
            schema,
            type,
            value: args
          }),
          context,
          path,
          schema,
          type,
          value
        });
      }

      args = type.typeArgs;
      type = type.type;
      value = _value;
    }
  } while (true);
};

const validateArgs = ({ args, context, path, schema, type, value }) =>
  _validateArgs({
    args,
    context,
    path,
    schema,
    type: { defaultValue: {}, fields: ensureObject(type.args) },
    value
  });

export default validateArgs;
