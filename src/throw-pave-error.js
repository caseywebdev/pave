import PaveError from './pave-error.js';

const { Intl } = globalThis;

const formatOr = values =>
  new Intl.ListFormat(undefined, {
    type: 'disjunction'
  }).format(values.map(value => `"${value}"`));

const formatPath = path =>
  path.length === 0 ? 'the query root' : `"${path.join('.')}"`;

const messages = {
  expectedArray: ({ path, value }) =>
    `An array was expected at ${formatPath(path)} but ${JSON.stringify(
      value
    )} was provided`,

  expectedArrayMaxLength: ({ type: { minLength }, path, value: { length } }) =>
    `An array of at most length ${minLength} was expected at ${formatPath(
      path
    )} but an array of length ${length} was provided`,

  expectedArrayMinLength: ({ path, type: { minLength }, value: { length } }) =>
    `An array of at least length ${minLength} was expected at ${formatPath(
      path
    )} but an array of length ${length} was provided`,

  expectedNonNull: ({ path, value }) =>
    `A non-null value was expected at ${formatPath(path)} but ${JSON.stringify(
      value
    )} was provided`,

  expectedOneOfType: ({ type: { oneOf }, path, value }) =>
    `A value matching one of type ${formatOr(
      Object.keys(oneOf)
    )} was expected at ${formatPath(path)} but ${JSON.stringify(
      value
    )} was provided`,

  expectedOneOfTypeField: ({ type: { oneOf }, path, field }) =>
    `A field matching one of ${formatOr(
      Object.keys(oneOf).map(key => `_on_${key}`)
    )} was expected at ${formatPath(path)} but ${JSON.stringify(
      field
    )} was provided`,

  expectedRequired: ({ path }) =>
    `A value was expected at ${formatPath(path)} but nothing was provided`,

  invalidQuery: ({ path, query }) =>
    `Expected a query object at ${formatPath(path)} but ${JSON.stringify(
      query
    )} was provided`,

  unexpectedField: ({ field, path }) =>
    `No fields were expected at ${formatPath(
      path
    )} but "${field}" was provided`,

  unknownField: ({ type: { fields }, path, field }) =>
    `A field matching one of ${formatOr(
      Object.keys(fields)
    )} was expected at ${formatPath(path)} but ${JSON.stringify(
      field
    )} was provided`,

  unknownType: ({ path, type }) =>
    `The type ${JSON.stringify(type)} at ${formatPath(
      path
    )} could not be found in the schema`
};

export default (code, context) => {
  throw Object.assign(new PaveError(messages[code](context)), {
    ...context,
    code
  });
};
