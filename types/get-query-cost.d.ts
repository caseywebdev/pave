export function getQueryCost<S extends Schema<any, any, any>>({ context, path, query, schema, type }: {
    context?: SchemaContext<S>;
    path?: string[];
    query: Query;
    schema: S;
    type: Type<S>;
}): any;
import type { Schema } from '#types/index.js';
import type { SchemaContext } from '#types/index.js';
import type { Query } from '#types/index.js';
import type { Type } from '#types/index.js';
