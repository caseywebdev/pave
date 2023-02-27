import isObject from './is-object.js';
import normalizeKey from './normalize-key.js';
import normalizeRoot from './normalize-root.js';

const { isArray } = Array;

const walk = ({ normalized = {}, data, getRef, query }) => {
  if (isArray(data)) {
    return data.map(data => walk({ normalized, data, getRef, query }));
  }

  if (!isObject(data) || data._type === undefined) return data;

  const ref = getRef?.(data);
  const obj = ref ? (normalized[ref] ??= {}) : {};

  // eslint-disable-next-line no-unused-vars
  const { _, $, ..._query } = query;
  Object.assign(_query, _query[`_on_${data._type}`]);
  for (const alias in _query) {
    if (data[alias] === undefined) continue;

    const query = _query[alias];
    const key = normalizeKey({ alias, query });
    const value = walk({ normalized, data: data[alias], getRef, query });
    obj[key] =
      isObject(value) && !isArray(value) && !value._type?.ref
        ? { ...obj[key], ...value }
        : value;
  }

  return ref ? { _type: { ref } } : obj;
};

export default ({ data, getRef, query }) => {
  const normalized = {};
  normalized[normalizeRoot({ query })] = walk({
    data,
    getRef,
    normalized,
    query
  });
  return normalized;
};
