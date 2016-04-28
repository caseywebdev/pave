const treeToQuery = ({branches, isLeaf}, key) => {
  const path = key ? [key] : [];
  const query = [[]];

  if (isLeaf) query[0].push(path);

  if (branches) {
    const sub = [[]];
    for (let key in branches) sub[0].push(treeToQuery(branches[key], key));
    query[0].push(path.concat(sub[0].length === 1 ? sub[0][0] : sub));
  }

  return query[0].length === 1 ? query[0][0] : query;
};

export default treeToQuery;
