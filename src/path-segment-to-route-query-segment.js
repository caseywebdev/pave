import isObject from './is-object';

export default segment =>
  isObject(segment) ? ['$obj', '$objs', '*'] : [segment, '$key', '$keys', '*'];
