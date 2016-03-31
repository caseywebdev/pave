import extend from './extend';
import isArray from './is-array';
import isObject from './is-object';

export default obj =>
  isArray(obj) ? obj.slice() :
  isObject(obj) ? extend({}, obj) :
  obj;
