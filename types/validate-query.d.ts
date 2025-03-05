export function validateQuery({ context, path, query, schema, type }: {
    context?: any;
    path?: string[];
    query: Query;
    schema: Schema<string, {}, any>;
    type: Type;
}): Query;
import type { Query } from '#src/index.js';
import type { Schema } from '#src/index.js';
import type { Type } from '#src/index.js';
