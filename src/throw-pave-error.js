import levenshtein from './levenshtein.js';
import PaveError from './pave-error.js';

const { Intl } = globalThis;

const formatOr = values =>
  new Intl.ListFormat(undefined, {
    type: 'disjunction'
  }).format(values.map(value => `"${value}"`));

const formatPath = path =>
  path.length === 0 ? 'the query root' : `"${path.join('"."')}"`;

const getSuggestion = (provided, expected) => {
  const suggestion = formatOr(
    expected
      .map(value => ({ distance: levenshtein(provided, value), value }))
      .sort((a, b) => (a.distance < b.distance ? -1 : 1))
      .flatMap(({ distance, value }) => (distance <= 2 ? value : []))
  );
  return suggestion && `. Did you mean ${suggestion}?`;
};

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
    `A non-null value is required at ${formatPath(path)}`,

  expectedOneOfType: ({ type: { oneOf }, path, value }) =>
    `The value ${JSON.stringify(value)} at ${formatPath(
      path
    )} does not resolve to ${formatOr(Object.keys(oneOf))}`,

  expectedOneOfTypeKey: ({ type: { oneOf }, path, key }) =>
    `The key ${JSON.stringify(key)} does not exist at ${formatPath(
      path
    )}${getSuggestion(
      key,
      Object.keys(oneOf).map(key => `_on_${key}`)
    )}`,

  expectedRequired: ({ path }) => `A value is required at ${formatPath(path)}`,

  invalidQuery: ({ path, query }) =>
    `The query object ${JSON.stringify(query)} at ${formatPath(
      path
    )} is invalid`,

  unexpectedKey: ({ key, path }) =>
    `The key ${JSON.stringify(
      key
    )} (or any other key) is not expected at ${formatPath(path)}`,

  unexpectedValue: ({ path, value }) =>
    `The value ${JSON.stringify(value)} was found at ${formatPath(
      path
    )} but no value is ever expected there`,

  unknownKey: ({ alias, type: { object }, path, key }) =>
    `The key ${JSON.stringify(key)}${
      alias === key ? '' : ` (aliased as ${JSON.stringify(alias)})`
    } does not exist at ${formatPath(path)}${getSuggestion(
      key,
      Object.keys(object)
    )}`,

  unknownType: ({ path, type }) =>
    `The type ${JSON.stringify(type)} at ${formatPath(path)} does not exist`
};

export default (code, context) => {
  throw Object.assign(new PaveError(messages[code](context)), {
    ...context,
    code
  });
};
