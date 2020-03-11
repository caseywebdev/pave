import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isObject from './is-object.js';
import normalizeField from './normalize-field.js';

const walk = ({ _, cache, query, value }) => {
  if (isArray(value)) {
    return value.map(value => walk({ _, cache, query, value }));
  }

  if (!isObject(value) || '_literal' in value) return value;

  if (value._ref) return walk({ _, cache, query, value: cache[value._ref] });

  // eslint-disable-next-line no-unused-vars
  const { _args, _field, ..._query } = ensureObject(query);
  return Object.fromEntries(
    Object.entries(_query).map(([alias, query]) => {
      const field = normalizeField({ alias, query });
      if (field in value) {
        return [alias, walk({ _, cache, query, value: value[field] })];
      } else {
        _.isPartial = true;
        return [alias, null];
      }
    })
  );
};

export default args => {
  const { cache, query } = args;
  const _ = { isPartial: false };
  const value = 'value' in args ? args.value : cache._root;
  const result = walk({ _, cache, query, value });
  if (!_.isPartial) return result;
};
