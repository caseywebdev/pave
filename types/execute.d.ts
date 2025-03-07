export function execute<S extends Schema<any, any, any>>({ context, object, path, query, schema, type, value }: {
    context?: any;
    object?: any;
    path?: string[];
    query: Query;
    schema: S;
    type: Type<S, any, any, any, any>;
    value?: any;
}): Promise<any>;
import type { Schema } from '#types/index.js';
import type { Query } from '#types/index.js';
import type { Type } from '#types/index.js';
