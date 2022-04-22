import isArray from './is-array.js';
import isObject from './is-object.js';

const orderObject = obj => {
  if (!isObject(obj)) return obj;

  if (isArray(obj)) return obj.map(obj => orderObject(obj));

  const val = {};
  const keys = Object.keys(obj).sort();
  const l = keys.length;
  for (let i = 0; i < l; ++i) {
    const k = keys[i];
    val[k] = orderObject(obj[k]);
  }
  return val;
};

export default ({ alias, query: { _args, _field } }) =>
  (_field ?? alias) +
  (Object.keys(_args ?? {}).length
    ? `(${JSON.stringify(orderObject(_args))})`
    : '');
