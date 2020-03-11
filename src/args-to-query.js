import isObject from './is-object.js';

const argsToQuery = args => {
  if (!isObject(args)) return {};

  // eslint-disable-next-line no-unused-vars
  const { _args, _field, ..._query } = args || {};
  return Object.fromEntries(
    Object.entries(_query).map(([key, args]) => [key, argsToQuery(args)])
  );
};

export default argsToQuery;
