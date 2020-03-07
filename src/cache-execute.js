import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isObject from './is-object.js';
import stringifyArgs from './stringify-args.js';

const walk = ({ _, data, node, query }) => {
  if (node === undefined) _.isPartial = true;

  if (isArray(node)) return node.map(node => walk({ _, data, query, node }));

  if (!isObject(node) || '_literal' in node) return node == null ? null : node;

  if (node._ref) return walk({ _, data, node: data[node._ref], query });

  // eslint-disable-next-line no-unused-vars
  const { _args, _from, ..._query } = ensureObject(query);
  const obj = {};
  for (const alias in _query) {
    const query = _query[alias];
    let from = query._from || alias;
    const args = ensureObject(query._args);
    if (Object.keys(args).length) from += `(${stringifyArgs(args)})`;
    obj[alias] = walk({ _, data, node: node[from], query });
  }
  return obj;
};

export default ({ data, key, query }) => {
  const _ = { isPartial: false };
  return {
    data: walk({ _, data, node: data[key || '_root'], query }),
    isPartial: _.isPartial
  };
};
