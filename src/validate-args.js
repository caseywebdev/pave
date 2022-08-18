import validateValue from './validate-value.js';

export default ({ args, context, path = [], query, schema, type }) => {
  args = validateValue({
    context,
    path,
    query,
    schema,
    type: { defaultValue: {}, fields: type?.args ?? {} },
    value: args
  });

  return (
    type?.validateArgs?.({
      args,
      context,
      path,
      query: { ...query, _args: args },
      schema,
      type
    }) ?? args
  );
};
