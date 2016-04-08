import deltaDirectives from './delta-directives';
import flatten from './flatten';
import isArray from './is-array';
import isObject from './is-object';
import resolvePath from './resolve-path';

const resolveDelta = (cache, delta, path = []) => {
  const deltas = [];

  if (!isObject(delta)) return deltas;

  if (isArray(delta)) {
    delta = flatten(delta);

    for (let i = 0, l = delta.length; i < l; ++i) {
      deltas.push.apply(deltas, resolveDelta(cache, delta[i]));
    }

    return deltas;
  }

  for (let key in delta) {
    const directive = deltaDirectives[key];
    if (directive) {
      for (let i = path.length - 1; i >= 0; --i) delta = {[path[i]]: delta};
      return [delta];
    }
  }

  for (let key in delta) {
    deltas.push.apply(
      deltas,
      resolveDelta(cache, delta[key], resolvePath(cache, path).concat(key))
    );
  }

  return deltas;
};

export default resolveDelta;
