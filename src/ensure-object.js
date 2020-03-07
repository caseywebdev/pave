import isArray from './is-array.js';
import isObject from './is-object.js';

export default obj => (isObject(obj) && !isArray(obj) ? obj : {});
