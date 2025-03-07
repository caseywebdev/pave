export function getQueryCost<Context = any>({ context, path, query, schema, type }: {
    context?: Context;
    path?: string[];
    query: Query;
    schema: Schema<string, {}, any>;
    type: Type;
}): any;
import type { Query } from '#types/index.d.ts';
import type { Schema } from '#types/index.d.ts';
import type { Type } from '#types/index.d.ts';
