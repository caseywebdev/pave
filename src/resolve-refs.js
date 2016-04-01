import get from './get';
import isArray from './is-array';
import isObject from './is-object';

const resolveRefs = (cache, obj, visited, key) => {
  const setVisited = val => key ? visited[key] = val : val;

  if (!isObject(obj)) return setVisited(obj);

  if (isArray(obj)) {
    const val = setVisited([]);
    for (let i = 0, l = obj.length; i < l; ++i) {
      val.push(resolveRefs(cache, obj[i], visited));
    }
    return val;
  }

  const {$ref} = obj;
  if ($ref) return setVisited(get(cache, $ref, visited));

  const val = setVisited({});
  for (let key in obj) val[key] = resolveRefs(cache, obj[key], visited);
  return val;
};

export default resolveRefs;
