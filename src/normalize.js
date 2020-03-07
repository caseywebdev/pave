import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isObject from './is-object.js';
import stringifyArgs from './stringify-args.js';

const walk = ({ normalized = {}, data, getKey, query }) => {
  if (isArray(data)) {
    return data.map(data => walk({ normalized, data, getKey, query }));
  }

  if (!isObject(data) || '_literal' in data) return data == null ? null : data;

  // eslint-disable-next-line no-unused-vars
  const { _args, _from, ..._query } = ensureObject(query);
  const _ref = getKey && getKey(data);
  const obj = _ref ? normalized[_ref] || (normalized[_ref] = {}) : {};
  for (const alias in _query) {
    const query = ensureObject(_query[alias]);
    const args = ensureObject(query._args);
    let from = query._from || alias;
    if (Object.keys(args).length) from += `(${stringifyArgs(args)})`;
    obj[from] = walk({ normalized, data: data[alias], getKey, query });
  }

  return _ref ? { _ref } : obj;
};

export default ({ data, getKey, key, query }) => {
  const normalized = {};
  const root = walk({ data, getKey, normalized, query });
  if (!key) normalized._root = root;
  return normalized;
};
