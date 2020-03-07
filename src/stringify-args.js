import isArray from './is-array.js';
import isObject from './is-object.js';

const orderObject = obj => {
  if (!isObject(obj)) return obj;

  if (isArray(obj)) return obj.map(obj => orderObject(obj));

  const val = {};
  const keys = Object.keys(obj).sort();
  for (let i = 0, l = keys.length; i < l; ++i) {
    val[keys[i]] = orderObject(obj[keys[i]]);
  }
  return val;
};

export default args => JSON.stringify(orderObject(args));
