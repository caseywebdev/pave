export function normalize({ data, getKey, query }: {
    data: any;
    getKey?: (value: {
        [K: string]: any;
    }) => string | null;
    query: Query;
}): {
    [K: string]: any;
};
import type { Query } from '#types/index.d.ts';
