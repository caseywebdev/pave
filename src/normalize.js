import isArray from './is-array.js';
import isObject from './is-object.js';
import normalizeField from './normalize-field.js';
import normalizeRoot from './normalize-root.js';

const walk = ({ normalized = {}, data, getKey, query }) => {
  if (isArray(data)) {
    return data.map(data => walk({ normalized, data, getKey, query }));
  }

  if (!isObject(data) || data._type === undefined) return data;

  const key = getKey?.(data);
  const obj = key == null ? {} : (normalized[key] ??= {});

  // eslint-disable-next-line no-unused-vars
  const { _args, _field, ..._query } = query;
  Object.assign(_query, _query[`_on_${data._type}`]);
  for (const alias in _query) {
    if (data[alias] === undefined) continue;

    const query = _query[alias];
    const field = normalizeField({ alias, query });
    const value = walk({ normalized, data: data[alias], getKey, query });
    obj[field] =
      isObject(value) && !isArray(value) && value._type !== 'ref'
        ? { ...obj[field], ...value }
        : value;
  }

  return key == null ? obj : { _type: '_ref', key };
};

export default ({ data, getKey, query }) => {
  const normalized = {};
  normalized[normalizeRoot({ query })] = walk({
    data,
    getKey,
    normalized,
    query
  });
  return normalized;
};
