import isObject from './is-object.js';

const injectType = query => {
  if (!isObject(query) || !Object.keys(query).length) return query;

  query = { _type: {}, ...query };
  for (const key in query) {
    if (key === '_args' || key === '_field' || key === '_type') continue;

    query[key] = injectType(query[key]);
  }

  return query;
};

export default injectType;
