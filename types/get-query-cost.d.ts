export function getQueryCost<Context = any>({ context, path, query, schema, type }: {
    context?: Context;
    path?: string[];
    query: Query;
    schema: Schema;
    type: Type;
}): any;
import type { Query } from '#src/index.js';
import type { Schema } from '#src/index.js';
import type { Type } from '#src/index.js';
