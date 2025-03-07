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
export type Type<TypeName extends string = never, Extensions extends {
    [K: string]: any;
} = {}, Context = unknown, Input = unknown, Object = unknown, Value = unknown, ResolvedValue = {}> = Recursive<TypeName | (({
    optional: Type<TypeName, Extensions, Context>;
} | {
    nullable: Type<TypeName, Extensions, Context>;
} | {
    arrayOf: Type<TypeName, Extensions, Context>;
    minLength?: number;
    maxLength?: number;
} | {
    oneOf: {
        [K: string]: Type<TypeName, Extensions, Context>;
    };
    resolveType: (value: NonNullable<unknown>) => string;
} | {
    object: {
        [K: string]: Type<TypeName, Extensions, Context>;
    };
    defaultType?: Type<TypeName, Extensions, Context>;
} | {
    input?: Type<TypeName, Extensions, Context>;
    type?: Type<TypeName, Extensions, Context>;
    typeInput?: any;
    resolve?: ((options: {
        context: Context;
        input: Input;
        object: Object;
        path: string[];
        query: Query;
        schema: Schema<TypeName, Extensions, Context>;
        type: Type;
        value: Value;
    }) => any) | {} | null;
}) & {
    cost?: number | ((options: {
        context: Context;
        cost: number;
        input: Input;
        object: Object;
        path: string[];
        query: Query;
        schema: Schema<TypeName, Extensions, Context>;
        type: Type;
        value: Value;
    }) => number);
    defaultValue?: any;
    validate?: (options: {
        context: Context;
        input: Input;
        object: Object;
        path: string[];
        query: Query;
        schema: Schema<TypeName, Extensions, Context>;
        type: Type;
        value: ResolvedValue;
    }) => any;
} & Extensions)>;
export type Schema<TypeName extends string, Extensions extends {
    [K: string]: any;
}, Context> = { [K in TypeName]: Type<TypeName, Extensions, Context, any, any, any, any>; };
