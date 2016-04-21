import clone from './clone';
import isObject from './is-object';
import deltaDirectives from './delta-directives';

const update = (obj, delta) => {
  if (obj == null) obj = {};

  if (isObject(delta)) {
    for (let key in deltaDirectives) {
      if (key in delta) return deltaDirectives[key](obj, delta[key]);
    }
  }

  const next = clone(obj);
  for (let key in delta) next[key] = update(next[key], delta[key]);

  return next;
};

export default update;
