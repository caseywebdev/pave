import isObject from './is-object.js';

const injectType = query => {
  if (!isObject(query)) return query;

  const original = query;
  for (const key in query) {
    if (key === '_args' || key === '_field' || key === '_type') continue;

    if (query === original) query = { _type: {}, ...query };
    query[key] = injectType(query[key]);
  }

  return query;
};

export default injectType;
