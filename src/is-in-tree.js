import toKey from './to-key';

export default (path, tree) => {
  let cursor = tree;

  for (let i = 0, l = path.length; i < l; ++i) {
    if (!cursor) return false;
    if (cursor.isLeaf) return true;
    cursor = cursor[toKey(path[i])];
  }

  return !!cursor && cursor.isLeaf;
};
