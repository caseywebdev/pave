import normalizeKey from './normalize-key.js';

export default ({ query: { $ } }) =>
  normalizeKey({ alias: '_root', query: { $ } });
