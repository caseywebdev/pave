const inject = ({ injection, query }) => {
  if (!injection) return query;

  query = { ...injection, ...query };
  for (const key in query) {
    query[key] =
      key === '_args' || key === '_from' || key in injection
        ? query[key]
        : inject({ injection, query: query[key] });
  }
  return query;
};

export default inject;
