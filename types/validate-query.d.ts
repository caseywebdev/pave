export function validateQuery<S extends Schema<any>>({ context, path, query, schema, type }: {
    context?: any;
    path?: string[];
    query: Query;
    schema: S;
    type: Type<S, any>;
}): Query;
import type { Schema } from '#types/index.js';
import type { Query } from '#types/index.js';
import type { Type } from '#types/index.js';
