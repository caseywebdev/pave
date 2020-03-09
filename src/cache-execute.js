import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isObject from './is-object.js';
import normalizeFrom from './normalize-from.js';

const walk = ({ _, cache, node, query }) => {
  if (isArray(node)) return node.map(node => walk({ _, cache, query, node }));

  if (!isObject(node) || '_literal' in node) return node;

  if (node._ref) return walk({ _, cache, node: cache[node._ref], query });

  // eslint-disable-next-line no-unused-vars
  const { _args, _from, ..._query } = ensureObject(query);
  const obj = {};
  for (const alias in _query) {
    const query = _query[alias];
    const from = normalizeFrom({ alias, query });
    if (from in node) {
      obj[alias] = walk({ _, cache, node: node[from], query });
    } else {
      _.isPartial = true;
    }
  }
  return obj;
};

export default args => {
  const { cache, query } = args;
  const _ = { isPartial: false };
  const node = 'node' in args ? args.node : cache._root;
  const result = walk({ _, cache, node, query });
  if (!_.isPartial) return result;
};
