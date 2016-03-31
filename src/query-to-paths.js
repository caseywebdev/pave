import isArray from './is-array';

const queryToPaths = (query, path = []) => {
  let i = 0;
  const l = query.length;
  while (i < l && !isArray(query[i])) ++i;

  if (i === l) return [path.concat(query)];

  const paths = [];
  path = path.concat(query.slice(0, i));
  const pivot = query[i];
  const rest = query.slice(i + 1);
  for (let i = 0, l = pivot.length; i < l; ++i) {
    paths.push.apply(paths, queryToPaths([].concat(pivot[i], rest), path));
  }

  return paths;
};

export default queryToPaths;
