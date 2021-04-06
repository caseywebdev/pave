import isArray from './is-array.js';
import isObject from './is-object.js';

const injectType = query => {
  query = { _type: {}, ...query };
  for (const key in query) {
    if (
      key !== '_args' &&
      key !== '_field' &&
      key !== '_type' &&
      isObject(query) &&
      !isArray(query)
    ) {
      query[key] = injectType(query[key]);
    }
  }
  return query;
};

export default injectType;
