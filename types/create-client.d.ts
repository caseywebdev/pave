export function createClient({ cache, execute, getKey, transformQuery }?: {
    cache?: {
        [K: string]: any;
    };
    execute?: (options: {
        query: Query;
        [K: string]: any;
    }) => any;
    getKey?: (value: any) => string;
    transformQuery?: (options: {
        query: Query;
    }) => Query;
}): {
    cache: {
        [K: string]: any;
    };
    cacheExecute: ({ key, query }: {
        key: any;
        query: any;
    }) => any;
    cacheUpdate: ({ data }: {
        data: any;
    }) => /*elided*/ any;
    execute: ({ query, ...rest }: {
        [x: string]: any;
        query: any;
    }) => Promise<any>;
    update: ({ data, query }: {
        data: any;
        query: any;
    }) => /*elided*/ any;
    watch: ({ data, onChange, query }: {
        data: any;
        onChange: any;
        query: any;
    }) => {
        unwatch: () => boolean;
        data?: undefined;
    } | {
        data: any;
        unwatch: () => boolean;
    };
};
import type { Query } from '#src/index.js';
