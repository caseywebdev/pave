import get from './get';
import isArray from './is-array';
import isObject from './is-object';

const resolveRefs = (cache, obj, maxDepth = 3, depth = 0) => {
  if (!isObject(obj)) return obj;

  if (isArray(obj)) {
    const val = [];
    for (let i = 0, l = obj.length; i < l; ++i) {
      val.push(resolveRefs(cache, obj[i], maxDepth, depth));
    }
    return val;
  }

  const {$ref} = obj;
  if ($ref) return get(cache, $ref, maxDepth, depth + 1);

  const val = {};
  for (let key in obj) val[key] = resolveRefs(cache, obj[key], maxDepth, depth);
  return val;
};

export default resolveRefs;
