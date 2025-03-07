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
export type SchemaOptions = {
    context?: any;
    extensions?: {
        [K: string]: any;
    };
    typeName?: string;
};
export type Schema<O extends SchemaOptions = {}, _Context = O["context"] extends undefined ? unknown : O["context"], _Extensions = O["extensions"] extends undefined ? {} : O["extensions"], TypeName = O["typeName"] extends string ? O["typeName"] : never> = { [K in TypeName extends string ? TypeName : never]: Type<Schema<O>, any>; };
export type SchemaContext<S extends Schema<any>> = S extends Schema<infer _, infer Context> ? Context : never;
export type SchemaExtensions<S extends Schema<any>> = S extends Schema<infer _, infer __, infer Extensions> ? Extensions : never;
export type SchemaTypeName<S extends Schema<any>> = S extends Schema<infer _, infer __, infer ___, infer TypeName> ? TypeName : never;
export type TypeOptions = {
    input?: any;
    object?: any;
    resolvedValue?: {};
    value?: any;
};
export type Type<S extends Schema<any> = Schema<{}, unknown, unknown, never>, O extends TypeOptions = {}, Input = O["input"] extends undefined ? unknown : O["input"], Object = O["object"] extends undefined ? unknown : O["object"], ResolvedValue = O["resolvedValue"] extends undefined ? {} : O["resolvedValue"], Value = O["value"] extends undefined ? undefined : O["value"]> = Recursive<SchemaTypeName<S> | (({
    optional: Type<S, any>;
} | {
    nullable: Type<S, any>;
} | {
    arrayOf: Type<S, any>;
    minLength?: number;
    maxLength?: number;
} | {
    oneOf: {
        [K: string]: Type<S, any>;
    };
    resolveType: (value: {}) => string;
} | {
    object: {
        [K: string]: Type<S, any>;
    };
    defaultType?: Type<S, any>;
} | {
    input?: Type<S, any>;
    type?: Type<S, any>;
    typeInput?: any;
    resolve?: ((options: {
        context: SchemaContext<S>;
        input: Input;
        object: Object;
        path: string[];
        query: Query;
        schema: S;
        type: Type<S, any>;
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
        type: Type<S, any>;
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
        type: Type<S, any>;
        value: ResolvedValue;
    }) => any;
} & SchemaExtensions<S>)>;
export type Query<T = any> = {
    _?: string;
    $?: any;
    _type?: { [K in keyof any]: never; };
} | {
    [K: string]: Query<T>;
};
