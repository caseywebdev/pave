import isObject from './is-object.js';

const getTypes = type => {
  do {
    if (type == null) return {};
    else if (!isObject(type)) return { [type]: type };
    else if (type.optional) type = type.optional;
    else if (type.nullable) type = type.nullable;
    else if (type.arrayOf) type = type.arrayOf;
    else if (type.oneOf) {
      const types = {};
      for (const _type of type.oneOf) Object.assign(types, getTypes(_type));
      return types;
    } else if (type.name) return { [type.name]: type };
    else return {};
  } while (true);
};

export default getTypes;
