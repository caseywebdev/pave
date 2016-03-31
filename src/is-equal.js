import toKey from './to-key';
import getRaw from './get-raw';
import isObject from './is-object';
import isArray from './is-array';

const checkRefs = (raw, a, b, visited) => {

  // Values aren't refs.
  if (!isObject(raw)) return true;

  // Look for refs in an array.
  if (isArray(raw)) {
    for (let i = 0, l = raw.length; i < l; ++i) {
      if (!checkRefs(raw[i], a, b, visited)) return false;
    }

    return true;
  }

  // Found a ref.
  if (raw.$ref) return isEqual(raw.$ref, a, b, visited);

  // Look for refs in an object.
  for (let key in raw) if (!checkRefs(raw[key], a, b, visited)) return false;

  return true;
};

const isEqual = (path, a, b, visited = {}) => {
  const key = toKey(path);
  if (visited[key]) return true;

  const raw = getRaw(a, path);
  if (raw !== getRaw(b, path)) return false;

  visited[key] = true;
  return checkRefs(raw, a, b, visited);
};

export default isEqual;
