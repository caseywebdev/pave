export function validateSchema({ extensions, schema }: {
    extensions?: {
        [K: string]: any;
    };
    schema: Schema;
}): any;
import type { Schema } from '#src/index.js';
