import isObject from './is-object.js';

const injectType = query => {
  if (!isObject(query)) return query;

  const initial = query;
  for (const key in initial) {
    if (key === '$' || key === '_' || key === '_type') continue;

    if (query === initial) query = { _type: {}, ...query };
    query[key] = injectType(query[key]);
  }

  return query;
};

export default injectType;
