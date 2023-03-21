import isObject from './is-object.js';
import normalizeKey from './normalize-key.js';
import normalizeRoot from './normalize-root.js';

const { isArray } = Array;

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

    if (isArray(value._type)) {
      value = cache[value._type[0]];
      continue;
    }

    // eslint-disable-next-line no-unused-vars
    let { _args, _field, ..._query } = query;
    _query = _query[`_on_${value._type}`] ?? _query;
    const data = {};
    for (const alias in _query) {
      if (alias.startsWith('_on_')) continue;

      const query = _query[alias];
      const key = normalizeKey({ alias, query });
      const resolved = walk({ cache, query, value: value[key] });
      if (resolved === undefined) return;

      data[alias] = resolved;
    }
    return data;
  }
};

export default ({ cache, key, query }) =>
  walk({ cache, query, value: cache[key ?? normalizeRoot({ query })] });
