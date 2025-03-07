export function validateSchema<TypeName extends string = string, Extensions extends {
    [K: string]: any;
} = {
    [K: string]: any;
}, Context = any>({ extensions, schema }: {
    extensions?: {
        [K: string]: any;
    };
    schema: Schema<TypeName, Extensions, Context>;
}): any;
import type { Schema } from '#types/index.js';
