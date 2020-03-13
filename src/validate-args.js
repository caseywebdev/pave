import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';
import PaveError from './pave-error.js';

const validateArgs = o => {
  const { args, path = [], schema, type, value } = o;

  if (type == null) return value;

  if (!isObject(type)) {
    const _type = schema[type];
    if (!_type) throw new PaveError('unknownType', o);

    return validateArgs({ ...o, type: _type });
  }

  if (value === undefined && type.defaultValue !== undefined) {
    return validateArgs({ ...o, value: type.defaultValue });
  }

  if (type.nonNull) {
    if (value == null) throw new PaveError('expectedNonNull', o);

    return validateArgs({ ...o, type: type.nonNull });
  }

  if (type.arrayOf) {
    if (!isArray(value)) throw new PaveError('expectedArray', o);

    return Promise.all(
      value.map(value => validateArgs({ ...o, value, type: type.arrayOf }))
    );
  }

  if (type.oneOf) return validateArgs({ ...o, type: type.resolveType(value) });

  if (value == null) return null;

  if (type.fields) {
    let _value = {};
    for (const field in type.fields) _value[field] = undefined;
    _value = { ..._value, ...value };
    for (const field in _value) {
      const value = _value[field];
      const _type = type.fields[field];
      if (!_type) throw new PaveError('unknownField', { ...o, field });

      _value[field] = validateArgs({
        ...o,
        value,
        path: path.concat(field),
        type: _type
      });
    }
    return _value;
  }

  let _value = 'resolve' in type ? type.resolve : value;
  if (isFunction(_value)) {
    _value = _value({
      ...o,
      args: validateArgs({
        ...o,
        path: path.concat('_args'),
        type: { defaultValue: {}, fields: type.args },
        value: args
      })
    });
  }

  return validateArgs({
    ...o,
    args: type.typeArgs,
    type: type.type,
    value: _value
  });
};

export default validateArgs;
