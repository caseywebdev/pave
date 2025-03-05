export function validateSchema({ extensions, schema }: {
    extensions?: {
        [K: string]: any;
    };
    schema: Schema<string, {}, any>;
}): any;
import type { Schema } from '#src/index.js';
