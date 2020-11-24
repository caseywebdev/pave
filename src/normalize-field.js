import ensureObject from './ensure-object.js';
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

export default ({ alias, query }) => {
  const field = query._field ?? alias;
  const args = ensureObject(query._args);
  if (!Object.keys(args).length) return field;

  return field + `(${JSON.stringify(orderObject(args))})`;
};
