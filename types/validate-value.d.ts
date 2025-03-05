export function validateValue({ context, object, path, query, schema, type, value }: {
    context?: any;
    object?: any;
    path?: string[];
    query?: Query;
    schema: Schema<string, {}, any>;
    type: Type;
    value?: any;
}): any;
import type { Query } from '#src/index.js';
import type { Schema } from '#src/index.js';
import type { Type } from '#src/index.js';
