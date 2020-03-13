import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isObject from './is-object.js';
import normalizeField from './normalize-field.js';

const walk = ({ _, cache, query, value }) => {
  if (isArray(value)) {
    return value.map(value => walk({ _, cache, query, value }));
  }

  if (!isObject(value) || !('_type' in value)) return value;

  if (value._type === '_ref') {
    return walk({ _, cache, query, value: cache[value.key] });
  }

  // eslint-disable-next-line no-unused-vars
  const { _args, _field, ..._query } = ensureObject(query);
  Object.assign(_query, _query[`_on${value._type}`]);
  const data = {};
  for (const alias in _query) {
    if (alias.startsWith('_on')) continue;

    const query = ensureObject(_query[alias]);
    const field = normalizeField({ alias, query });
    if (field in value) {
      data[alias] = walk({ _, cache, query, value: value[field] });
    } else _.isPartial = true;
  }
  return data;
};

export default args => {
  const { cache, query } = args;
  const _ = { isPartial: false };
  const value = 'value' in args ? args.value : cache._root;
  const result = walk({ _, cache, query, value });
  if (!_.isPartial) return result;
};
