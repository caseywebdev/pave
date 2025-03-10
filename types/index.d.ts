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
export type Recursive<T> = T | RecursiveArray<T>;
export type RecursiveArray<T> = Recursive<T>[];
export type TypeOptions = {
    context?: any;
    extensions?: {
        [K: string]: any;
    };
    input?: any;
    object?: any;
    resolvedValue?: {};
    typeName?: string | unknown;
    value?: any;
};
export type DefaultTypeOptions = {
    context: unknown;
    extensions: {};
    input: unknown;
    object: unknown;
    resolvedValue: {};
    typeName: unknown;
    value: unknown;
};
export type GetTypeOption<Obj extends TypeOptions, Key extends keyof TypeOptions> = undefined extends Obj[Key] ? DefaultTypeOptions[Key] : Obj[Key];
export type SharedTypeOptions<O extends TypeOptions> = Pick<O, "context" | "extensions" | "typeName">;
export type Type<O extends TypeOptions = DefaultTypeOptions> = Recursive<GetTypeOption<O, "typeName"> | (({
    optional: Type<SharedTypeOptions<O>>;
} | {
    nullable: Type<SharedTypeOptions<O>>;
} | {
    arrayOf: Type<SharedTypeOptions<O>>;
    minLength?: number;
    maxLength?: number;
} | {
    oneOf: {
        [K: string]: Type<SharedTypeOptions<O>>;
    };
    resolveType: (value: {}) => string;
} | {
    object: {
        [K: string]: Type<SharedTypeOptions<O>>;
    };
    defaultType?: Type<SharedTypeOptions<O>>;
} | {
    input?: Type<SharedTypeOptions<O>>;
    type?: Type<SharedTypeOptions<O>>;
    typeInput?: any;
    resolve?: ((options: {
        context: GetTypeOption<O, "context">;
        input: GetTypeOption<O, "input">;
        object: GetTypeOption<O, "object">;
        path: string[];
        query: Query;
        schema: Schema<SharedTypeOptions<O>>;
        type: Type<SharedTypeOptions<O>>;
        value: GetTypeOption<O, "typeName">;
    }) => any) | {} | null;
}) & {
    cost?: number | ((options: {
        context: GetTypeOption<O, "context">;
        cost: number;
        input: GetTypeOption<O, "input">;
        object: GetTypeOption<O, "object">;
        path: string[];
        query: Query;
        schema: Schema<SharedTypeOptions<O>>;
        type: Type<SharedTypeOptions<O>>;
        value: GetTypeOption<O, "typeName">;
    }) => number);
    defaultValue?: any;
    validate?: (options: {
        context: GetTypeOption<O, "context">;
        input: GetTypeOption<O, "input">;
        object: GetTypeOption<O, "object">;
        path: string[];
        query: Query;
        schema: Schema<SharedTypeOptions<O>>;
        type: Type<SharedTypeOptions<O>>;
        value: GetTypeOption<O, "resolvedValue">;
    }) => any;
} & GetTypeOption<O, "extensions">)>;
export type Schema<O extends TypeOptions = DefaultTypeOptions> = GetTypeOption<O, "typeName"> extends string ? { [K in GetTypeOption<O, "typeName">]: Type<SharedTypeOptions<O>>; } : { [K in keyof any]: never; };
export type Query<T = any> = {
    _?: string;
    $?: any;
    _type?: { [K in keyof any]: never; };
} | {
    [K: string]: Query<T>;
};
