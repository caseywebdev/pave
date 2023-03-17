import normalizeKey from './normalize-key.js';

export default ({ query: { _args } }) =>
  normalizeKey({ alias: '_root', query: { _args } });
