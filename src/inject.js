const inject = ({ injection, query }) => {
  query = { ...query, ...injection };
  for (const key in query) {
    query[key] =
      key === '_args' || key === '_field' || key in injection
        ? query[key]
        : inject({ injection, query: query[key] });
  }
  return query;
};

export default inject;
