import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isObject from './is-object.js';
import normalizeField from './normalize-field.js';

const walk = ({ normalized = {}, data, getKey, query }) => {
  if (isArray(data)) {
    return data.map(data => walk({ normalized, data, getKey, query }));
  }

  if (!isObject(data) || data._type === undefined) return data;

  const key = getKey && getKey(data);
  const obj = key ? normalized[key] ?? (normalized[key] = {}) : {};

  // eslint-disable-next-line no-unused-vars
  const { _args, _field, ..._query } = ensureObject(query);
  Object.assign(_query, _query[`_on_${data._type}`]);
  for (const alias in _query) {
    if (!(alias in data)) continue;

    const query = ensureObject(_query[alias]);
    const field = normalizeField({ alias, query });
    const value = walk({ normalized, data: data[alias], getKey, query });
    obj[field] =
      isObject(value) && !isArray(value) && value._type !== 'ref'
        ? { ...obj[field], ...value }
        : value;
  }

  return key ? { _type: '_ref', key } : obj;
};

export default ({ data, getKey, query }) => {
  const normalized = {};
  normalized._root = walk({ data, getKey, normalized, query });
  return normalized;
};
