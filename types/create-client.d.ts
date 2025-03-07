export function createClient<Execute extends (options: {
    query: Query;
    [K: string]: any;
}) => Promise<any>>({ cache, execute, getKey, transformQuery }: {
    cache?: {
        [K: string]: any;
    };
    execute: Execute;
    getKey?: (value: {
        [K: string]: any;
    }) => string | null;
    transformQuery?: (options: {
        key?: string;
        query: Query;
    }) => Query;
}): {
    cache: {
        [K: string]: any;
    };
    /** @param {{ key?: string; query: Query }} options */
    cacheExecute: ({ key, query }: {
        key?: string;
        query: Query;
    }) => any;
    /** @param {{ data: any }} options */
    cacheUpdate: ({ data }: {
        data: any;
    }) => /*elided*/ any;
    /** @param {Parameters<Execute>[0]} options */
    execute: ({ query, ...rest }: Parameters<Execute>[0]) => Promise<any>;
    /** @param {{ data: any; query: Query }} options */
    update: ({ data, query }: {
        data: any;
        query: Query;
    }) => /*elided*/ any;
    /** @param {Watcher} options */
    watch: ({ data, onChange, query }: Watcher) => {
        unwatch: () => boolean;
        data?: undefined;
    } | {
        data: any;
        unwatch: () => boolean;
    };
};
export type Watcher = {
    data?: any;
    onChange: (data: any) => void;
    query?: Query;
};
import type { Query } from '#types/index.d.ts';
