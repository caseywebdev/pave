import toKey from './to-key';

export default paths => {
  const tree = {value: []};
  if (!paths.length) return tree;

  for (let i = 0, l = paths.length; i < l; ++i) {
    const path = paths[i];
    let cursor = tree;
    for (let j = 0, m = path.length; j < m; ++j) {
      const value = path[j];
      const key = toKey(value);
      let {branches} = cursor;
      if (!branches) branches = cursor.branches = {};
      if (!branches[key]) branches[key] = {value: value};
      cursor = branches[key];
    }
    cursor.isLeaf = true;
  }

  return tree;
};
