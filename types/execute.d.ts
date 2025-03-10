export function execute({ context, object, path, query, schema, type, value }: {
    context?: any;
    object?: any;
    path?: string[];
    query: Query;
    schema: Schema<any>;
    type: Type<any>;
    value?: any;
}): Promise<any>;
import type { Query } from '#types/index.js';
import type { Schema } from '#types/index.js';
import type { Type } from '#types/index.js';
