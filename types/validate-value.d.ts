export function validateValue({ context, object, path, query, schema, type, value }: {
    context?: any;
    object?: any;
    path?: string[];
    query?: Query;
    schema: Schema<any>;
    type: Type<any>;
    value?: any;
}): any;
import type { Query } from '#types/index.js';
import type { Schema } from '#types/index.js';
import type { Type } from '#types/index.js';
