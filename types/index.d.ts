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
export type Get<Value, Fallback> = undefined extends Value ? Fallback : Value;
export type TypeOptions = {
    context?: any;
    extensions?: {};
    input?: any;
    object?: any;
    resolvedValue?: {};
    typeName?: string;
    value?: any;
};
export type SubType<O extends TypeOptions> = Type<{
    context: O["context"];
    extensions: O["extensions"];
    typeName: O["typeName"];
}>;
export type Type<O extends TypeOptions = {}> = Recursive<(O["typeName"] extends string ? O["typeName"] : never) | (({
    optional: SubType<O>;
} | {
    nullable: SubType<O>;
} | {
    arrayOf: SubType<O>;
    minLength?: number;
    maxLength?: number;
} | {
    oneOf: {
        [K: string]: SubType<O>;
    };
    resolveType: (value: {}) => string;
} | {
    object: {
        [K: string]: SubType<O>;
    } | SubType<O>[];
    defaultType?: SubType<O>;
} | {
    input?: SubType<O>;
    type?: SubType<O>;
    typeInput?: any;
    resolve?: ((options: {
        context: Get<O["context"], any>;
        input: Get<O["input"], any>;
        object: Get<O["object"], any>;
        path: string[];
        query: Query;
        schema: Schema<O>;
        type: SubType<O>;
        value: Get<O["value"], any>;
    }) => any) | {} | null;
}) & {
    cost?: number | ((options: {
        context: Get<O["context"], any>;
        cost: number;
        input: Get<O["input"], any>;
        object: Get<O["object"], any>;
        path: string[];
        query: Query;
        schema: Schema<O>;
        type: SubType<O>;
        value: Get<O["value"], any>;
    }) => number);
    defaultValue?: any;
    validate?: (options: {
        context: Get<O["context"], any>;
        input: Get<O["input"], any>;
        object: Get<O["object"], any>;
        path: string[];
        query: Query;
        schema: Schema<O>;
        type: SubType<O>;
        value: Get<O["resolvedValue"], any>;
    }) => any;
} & Get<O["extensions"], {}>)>;
export type Schema<O extends TypeOptions = {}> = O["typeName"] extends string ? { [K in O["typeName"]]: SubType<O>; } : { [K in keyof any]: never; };
export type Query<T = any> = {
    _?: string;
    $?: any;
    _type?: { [K in keyof any]: never; };
} | {
    [K: string]: Query<T>;
};
