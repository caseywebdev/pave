import ensureObject from './ensure-object.js';
import isArray from './is-array.js';
import isFunction from './is-function.js';
import isObject from './is-object.js';

const execute = async ({ context, node, obj, query }) => {
  if (isFunction(node)) {
    return execute({
      context,
      node: await node({
        args: ensureObject(ensureObject(query)._args),
        context: ensureObject(context),
        obj: ensureObject(obj)
      }),
      obj,
      query
    });
  }

  if (isArray(node)) {
    return Promise.all(
      node.map(node => execute({ context, node, obj, query }))
    );
  }

  if (!isObject(node) || '_literal' in node) return node == null ? null : node;

  if (isObject(node._link) && !isArray(node._link)) {
    return execute({ ...node._link, context, query });
  }

  // eslint-disable-next-line no-unused-vars
  const { _args, _from, ..._query } = ensureObject(query);
  return Object.fromEntries(
    await Promise.all(
      Object.entries(_query).map(async ([alias, query]) => {
        const _node = node[query._from || alias];
        return [alias, await execute({ context, node: _node, obj, query })];
      })
    )
  );
};

export default execute;