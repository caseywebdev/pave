import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isObject from './is-object.js';
import normalizeFrom from './normalize-from.js';

const walk = ({ normalized = {}, data, getKey, query }) => {
  if (isArray(data)) {
    return data.map(data => walk({ normalized, data, getKey, query }));
  }

  if (!isObject(data) || '_literal' in data) return data;

  // eslint-disable-next-line no-unused-vars
  const { _args, _from, ..._query } = ensureObject(query);
  const _ref = getKey && getKey(data);
  const obj = _ref ? normalized[_ref] || (normalized[_ref] = {}) : {};
  for (const alias in _query) {
    if (!(alias in data)) continue;

    const query = ensureObject(_query[alias]);
    const from = normalizeFrom({ alias, query });
    obj[from] = walk({ normalized, data: data[alias], getKey, query });
  }

  return _ref ? { _ref } : obj;
};

export default ({ data, getKey, query }) => {
  const normalized = {};
  normalized._root = walk({ data, getKey, normalized, query });
  return normalized;
};
