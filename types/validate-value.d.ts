export function validateValue<S extends Schema<any>>({ context, object, path, query, schema, type, value }: {
    context?: any;
    object?: any;
    path?: string[];
    query?: Query;
    schema: S;
    type: Type<S, any>;
    value?: any;
}): any;
import type { Schema } from '#types/index.js';
import type { Query } from '#types/index.js';
import type { Type } from '#types/index.js';
