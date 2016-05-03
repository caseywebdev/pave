import isObject from './is-object';

export default key =>
  isObject(key) ? ['$obj', '$objs', '*'] : [key, '$key', '$keys', '*'];
