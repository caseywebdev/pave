import isArray from './is-array';

const getQueryCost = (query, limit = Infinity, cost = 0, total = 0) => {
  let i = 0;
  const l = query.length;
  while (i < l && total + cost + i <= limit && !isArray(query[i])) ++i;

  if (total + (cost += i) > limit || i === l) return total + cost;

  const pivot = query[i];
  const rest = query.slice(i + 1);
  for (let i = 0, l = pivot.length; i < l; ++i) {
    total = getQueryCost([].concat(pivot[i], rest), limit, cost, total);
    if (total > limit) return total;
  }

  return total;
};

export default getQueryCost;
