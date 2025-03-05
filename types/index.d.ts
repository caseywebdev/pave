export { Context } from "#src/context.js";
export { createClient } from "#src/create-client.js";
export { execute } from "#src/execute.js";
export { getQueryCost } from "#src/get-query-cost.js";
export { injectType } from "#src/inject-type.js";
export { levenshtein } from "#src/levenshtein.js";
export { mergeRefs } from "#src/merge-refs.js";
export { PaveError } from "#src/pave-error.js";
export { validateQuery } from "#src/validate-query.js";
export { validateSchema } from "#src/validate-schema.js";
export { validateValue } from "#src/validate-value.js";
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
} & Extensions & object)>;
export type Schema<TypeName extends string, Extensions extends {
    [K: string]: any;
}, Context> = { [K in TypeName]: Type<TypeName, Extensions, Context, any, any, any, any>; };
