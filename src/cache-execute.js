import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isObject from './is-object.js';
import normalizeField from './normalize-field.js';

const walk = ({ cache, query, value }) => {
  do {
    if (isArray(value)) {
      const allResolved = [];
      const l = value.length;
      for (let i = 0; i < l; ++i) {
        const resolved = walk({ cache, query, value: value[i] });
        if (resolved === undefined) return;

        allResolved.push(resolved);
      }
      return allResolved;
    } else if (!isObject(value) || value._type === undefined) return value;
    else if (value._type === '_ref') value = cache[value.key];
    else {
      // eslint-disable-next-line no-unused-vars
      const { _args, _field, ..._query } = ensureObject(query);
      Object.assign(_query, _query[`_on_${value._type}`]);
      const data = {};
      for (const alias in _query) {
        if (alias.startsWith('_on_')) continue;

        const query = ensureObject(_query[alias]);
        const field = normalizeField({ alias, query });
        const resolved = walk({ cache, query, value: value[field] });
        if (resolved === undefined) return;

        data[alias] = resolved;
      }
      return data;
    }
  } while (true);
};

export default ({ cache, key, query }) =>
  walk({ cache, query, value: cache[key ?? '_root'] });
