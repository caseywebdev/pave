import isArray from './is-array';

const flatten = (obj, flattened = []) => {
  if (isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; ++i) flatten(obj[i], flattened);
  } else {
    flattened.push(obj);
  }
  return flattened;
};

export default flatten;
