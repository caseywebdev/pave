export function validateSchema({ extensions, schema }: {
    extensions?: {
        [K: string]: any;
    };
    schema: Schema<string, {}, any>;
}): any;
import type { Schema } from '#types/index.d.ts';
