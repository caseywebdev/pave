/** @import {Query} from '#src/index.js' */

import { normalizeKey } from '#src/normalize-key.js';

/** @param {{ query: Query }} options */
export const normalizeRoot = ({ query: { $ } }) =>
  normalizeKey({ alias: '_root', query: { $ } });
