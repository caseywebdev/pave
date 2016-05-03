import toKey from './to-key';

export default (path, tree) => {
  for (let i = 0, l = path.length; i < l; ++i) {
    if (!tree) return false;
    if (tree.isLeaf) return true;
    if (!tree.branches) return false;
    tree = tree.branches[toKey(path[i])];
  }

  return !!(tree && tree.isLeaf);
};
