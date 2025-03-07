export function validateQuery<TypeName extends string = string, Extensions extends {
    [K: string]: any;
} = {
    [K: string]: any;
}, Context = any>({ context, path, query, schema, type }: {
    context?: any;
    path?: string[];
    query: Query;
    schema: Schema<TypeName, Extensions, Context>;
    type: Type<TypeName, Extensions, Context>;
}): Query;
import type { Query } from '#types/index.js';
import type { Schema } from '#types/index.js';
import type { Type } from '#types/index.js';
