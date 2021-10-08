import normalizeField from './normalize-field.js';

export default ({ query: { _args } }) =>
  normalizeField({ alias: '_root', query: { _args } });
