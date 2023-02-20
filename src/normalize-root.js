import normalizeKey from './normalize-key.js';

export default ({ query: { _arg } }) =>
  normalizeKey({ alias: '_root', query: { _arg } });
