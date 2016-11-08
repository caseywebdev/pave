import toKey from './to-key';

export default (path, delta) => {
  for (let i = path.length - 1; i >= 0; --i) delta = {[toKey(path[i])]: delta};
  return delta;
};
