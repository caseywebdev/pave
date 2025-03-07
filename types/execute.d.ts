export function execute({ context, object, path, query, schema, type, value }: {
    context?: any;
    object?: any;
    path?: string[];
    query: Query;
    schema: Schema<string, {}, any>;
    type: Type;
    value?: any;
}): Promise<any>;
import type { Query } from '#types/index.d.ts';
import type { Schema } from '#types/index.d.ts';
import type { Type } from '#types/index.d.ts';
