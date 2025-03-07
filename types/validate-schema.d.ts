export function validateSchema<S extends Schema<any>>({ extensions, schema }: {
    extensions?: {
        [K: string]: any;
    };
    schema: S;
}): any;
import type { Schema } from '#types/index.js';
