import validateValue from './validate-value.js';

export default ({ args, context, path = [], query, schema, type }) =>
  validateValue({
    context,
    path,
    query,
    schema,
    type: {
      type: { fields: type?.args ?? {} },
      validate:
        type?.validateArgs &&
        (({ query, value, ...rest }) =>
          type.validateArgs({
            args: value,
            query: { _args: value, ...query },
            ...rest
          }))
    },
    value: args ?? {}
  });
