import resolveDelta from './resolve-delta';
import update from './update';

export default (cache, delta) => {
  const deltas = resolveDelta(cache, delta);
  for (let i = 0, l = deltas.length; i < l; ++i) {
    cache = update(cache, deltas[i]);
  }
  return cache;
};
