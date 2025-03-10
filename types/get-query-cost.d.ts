export function getQueryCost({ context, path, query, schema, type }: {
    context?: any;
    path?: string[];
    query: Query;
    schema: Schema<any>;
    type: Type<any>;
}): any;
import type { Query } from '#types/index.js';
import type { Schema } from '#types/index.js';
import type { Type } from '#types/index.js';
