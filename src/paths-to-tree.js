import toKey from './to-key';

export default paths => {
  const tree = {};
  if (!paths.length) return tree;

  for (let i = 0, l = paths.length; i < l; ++i) {
    const path = paths[i];
    let cursor = tree;
    for (let j = 0, m = path.length; j < m; ++j) {
      const key = toKey(path[j]);
      let {branches} = cursor;
      if (!branches) branches = cursor.branches = {};
      if (!branches[key]) branches[key] = {};
      cursor = branches[key];
    }
    cursor.isLeaf = true;
  }

  return tree;
};
