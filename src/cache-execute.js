import isArray from './is-array.js';
import isObject from './is-object.js';
import normalizeField from './normalize-field.js';
import normalizeRoot from './normalize-root.js';

const walk = ({ cache, query, value }) => {
  while (true) {
    if (isArray(value)) {
      const allResolved = [];
      const l = value.length;
      for (let i = 0; i < l; ++i) {
        const resolved = walk({ cache, query, value: value[i] });
        if (resolved === undefined) return;

        allResolved.push(resolved);
      }
      return allResolved;
    }

    if (!isObject(value) || value._type === undefined) return value;

    if (value._type === '_ref') {
      value = cache[value.key];
      continue;
    }

    // eslint-disable-next-line no-unused-vars
    const { _args, _field, ..._query } = query;
    Object.assign(_query, _query[`_on_${value._type}`]);
    const data = {};
    for (const alias in _query) {
      if (alias.startsWith('_on_')) continue;

      const query = _query[alias];
      const field = normalizeField({ alias, query });
      const resolved = walk({ cache, query, value: value[field] });
      if (resolved === undefined) return;

      data[alias] = resolved;
    }
    return data;
  }
};

export default ({ cache, key, query }) =>
  walk({ cache, query, value: cache[key ?? normalizeRoot({ query })] });
