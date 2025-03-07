export type { Context } from "#types/context.d.ts";
export type { createClient } from "#types/create-client.d.ts";
export type { execute } from "#types/execute.d.ts";
export type { getQueryCost } from "#types/get-query-cost.d.ts";
export type { injectType } from "#types/inject-type.d.ts";
export type { levenshtein } from "#types/levenshtein.d.ts";
export type { mergeRefs } from "#types/merge-refs.d.ts";
export type { PaveError } from "#types/pave-error.d.ts";
export type { validateQuery } from "#types/validate-query.d.ts";
export type { validateSchema } from "#types/validate-schema.d.ts";
export type { validateValue } from "#types/validate-value.d.ts";
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
