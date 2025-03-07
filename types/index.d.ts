export { Context } from "#types/context.js";
export { createClient } from "#types/create-client.js";
export { execute } from "#types/execute.js";
export { getQueryCost } from "#types/get-query-cost.js";
export { injectType } from "#types/inject-type.js";
export { levenshtein } from "#types/levenshtein.js";
export { mergeRefs } from "#types/merge-refs.js";
export { PaveError } from "#types/pave-error.js";
export { validateQuery } from "#types/validate-query.js";
export { validateSchema } from "#types/validate-schema.js";
export { validateValue } from "#types/validate-value.js";
export type Query<T = any> = {
    _?: string;
    $?: any;
    _type?: { [K in keyof any]: never; };
} | {
    [K: string]: Query<T>;
};
export type Recursive<T> = T | RecursiveArray<T>;
export type RecursiveArray<T> = Recursive<T>[];
export type Schema<TypeName extends string, Extensions extends {
    [K: string]: any;
}, Context> = { [K in TypeName]: Type<Schema<TypeName, Extensions, Context>, any, any, any, any>; };
export type SchemaTypeName<S extends Schema<any, any, any>> = S extends Schema<infer TypeName, any, any> ? TypeName : never;
export type SchemaExtensions<S extends Schema<any, any, any>> = S extends Schema<any, infer Extensions, any> ? Extensions : never;
export type SchemaContext<S extends Schema<any, any, any>> = S extends Schema<any, any, infer Context> ? Context : never;
export type Type<S extends Schema<any, any, any> = Schema<never, {}, unknown>, Input = unknown, Object = unknown, Value = unknown, ResolvedValue = {}> = Recursive<SchemaTypeName<S> | (({
    optional: Type<S>;
} | {
    nullable: Type<S>;
} | {
    arrayOf: Type<S>;
    minLength?: number;
    maxLength?: number;
} | {
    oneOf: {
        [K: string]: Type<S>;
    };
    resolveType: (value: NonNullable<unknown>) => string;
} | {
    object: {
        [K: string]: Type<S>;
    };
    defaultType?: Type<S>;
} | {
    input?: Type<S>;
    type?: Type<S>;
    typeInput?: any;
    resolve?: ((options: {
        context: SchemaContext<S>;
        input: Input;
        object: Object;
        path: string[];
        query: Query;
        schema: S;
        type: Type<S>;
        value: Value;
    }) => any) | {} | null;
}) & {
    cost?: number | ((options: {
        context: SchemaContext<S>;
        cost: number;
        input: Input;
        object: Object;
        path: string[];
        query: Query;
        schema: S;
        type: Type<S>;
        value: Value;
    }) => number);
    defaultValue?: any;
    validate?: (options: {
        context: SchemaContext<S>;
        input: Input;
        object: Object;
        path: string[];
        query: Query;
        schema: S;
        type: Type<S>;
        value: ResolvedValue;
    }) => any;
} & SchemaExtensions<S>)>;
