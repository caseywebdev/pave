import isFunction from './is-function.js';
import isObject from './is-object.js';

const typeToQuery = ({ schema, seen = new Set(), type }) => {
  if (seen.has(type) || !type || isFunction(type)) return {};

  seen = new Set(seen).add(type);

  if (!isObject(type)) {
    return typeToQuery({ schema, seen, type: schema[type] });
  }

  if (type.nonNull) {
    return typeToQuery({ schema, seen, type: type.nonNull });
  }

  if (type.arrayOf) {
    return typeToQuery({ schema, seen, type: type.arrayOf });
  }

  if (type.fields) {
    return Object.fromEntries(
      Object.entries(type.fields).map(([key, type]) => [
        key,
        typeToQuery({ schema, seen, type })
      ])
    );
  }

  return typeToQuery({ schema, seen, type: type.type });
};

export default typeToQuery;
