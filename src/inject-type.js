const injectType = query => {
  query = { _type: {}, ...query };
  for (const key in query) {
    if (key !== '_args' && key !== '_field' && key !== '_type') {
      query[key] = injectType(query[key]);
    }
  }
  return query;
};

export default injectType;
