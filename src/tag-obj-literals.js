import isArray from './is-array.js';
import isObject from './is-object.js';

const tagObjLiterals = value => {
  if (!isObject(value)) return value == null ? null : value;

  if (isArray(value)) return value.map(tagObjLiterals);

  return value._literal !== undefined ? value : { _literal: true, ...value };
};

export default tagObjLiterals;
