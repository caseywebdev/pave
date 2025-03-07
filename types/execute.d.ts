export function execute<TypeName extends string = string, Extensions extends {
    [K: string]: any;
} = {
    [K: string]: any;
}, Context = any>({ context, object, path, query, schema, type, value }: {
    context?: any;
    object?: any;
    path?: string[];
    query: Query;
    schema: Schema<TypeName, Extensions, Context>;
    type: Type<TypeName, Extensions, Context>;
    value?: any;
}): Promise<any>;
import type { Query } from '#types/index.js';
import type { Schema } from '#types/index.js';
import type { Type } from '#types/index.js';
