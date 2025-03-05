export function cacheExecute({ cache, key, query }: {
    cache: {
        [K: string]: any;
    };
    key?: string;
    query: Query;
}): any;
import type { Query } from '#src/index.js';
