import levenshtein from './levenshtein.js';
import PaveError from './pave-error.js';

const { Intl } = globalThis;

const formatOr = values =>
  new Intl.ListFormat(undefined, {
    type: 'disjunction'
  }).format(values.map(value => `"${value}"`));

const getSuggestion = (provided, expected) => {
  const suggestion = new Intl.ListFormat(undefined, {
    type: 'disjunction'
  }).format(
    expected
      .map(value => ({ distance: levenshtein(provided, value), value }))
      .sort((a, b) => (a.distance < b.distance ? -1 : 1))
      .flatMap(({ distance, value }) => (distance <= 5 ? `"${value}"` : []))
  );
  return suggestion && `. Did you mean ${suggestion}?`;
};

const formatPath = path =>
  path.length === 0 ? 'the query root' : `"${path.join('"."')}"`;

const messages = {
  expectedArray: ({ path, value }) =>
    `The value ${JSON.stringify(value)} at ${formatPath(
      path
    )} must be an array`,

  expectedArrayMaxLength: ({ type: { maxLength }, path, value: { length } }) =>
    `The array with length ${length} at ${formatPath(
      path
    )} must be at most length ${maxLength}`,

  expectedArrayMinLength: ({ path, type: { minLength }, value: { length } }) =>
    `The array with length ${length} at ${formatPath(
      path
    )} must be at least length ${minLength}`,

  expectedNonNull: ({ path }) =>
    `The value at ${formatPath(path)} cannot be null`,

  expectedOneOfType: ({ type: { oneOf }, path, value }) =>
    `The value ${JSON.stringify(value)} at ${formatPath(
      path
    )} does not resolve to ${formatOr(Object.keys(oneOf))}`,

  expectedOneOfTypeField: ({ type: { oneOf }, path, field }) =>
    `The field ${JSON.stringify(field)} at ${formatPath(
      path
    )} does not exist${getSuggestion(
      field,
      Object.keys(oneOf).map(key => `_on_${key}`)
    )}`,

  expectedRequired: ({ path }) => `A value at ${formatPath(path)} is required`,

  invalidQuery: ({ path, query }) =>
    `The query object ${JSON.stringify(query)} at ${formatPath(
      path
    )} but ${JSON.stringify(query)} is invalid`,

  unexpectedField: ({ field, path }) =>
    `The field ${JSON.stringify(field)} at ${formatPath(path)} is not expected`,

  unknownField: ({ type: { fields }, path, field }) =>
    `The field ${JSON.stringify(field)} at ${formatPath(
      path
    )} does not exist${getSuggestion(field, Object.keys(fields))}`,

  unknownType: ({ path, type }) =>
    `The type ${JSON.stringify(type)} at ${formatPath(path)} does not exist`
};

export default (code, context) => {
  throw Object.assign(new PaveError(messages[code](context)), {
    ...context,
    code
  });
};
