export function execute({ context, object, path, query, schema, type, value }: {
    context?: any;
    object?: any;
    path?: string[];
    query: Query;
    schema: Schema;
    type: Type;
    value?: any;
}): Promise<any>;
import type { Query } from '#src/index.js';
import type { Schema } from '#src/index.js';
import type { Type } from '#src/index.js';
