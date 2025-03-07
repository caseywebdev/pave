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
export type Schema<A extends SchemaOptions = {}, _Context = A["context"] extends undefined ? unknown : A["context"], _Extensions = A["extensions"] extends undefined ? {} : A["extensions"], TypeName = A["typeName"] extends undefined ? never : A["typeName"]> = { [K in TypeName extends string ? TypeName : never]: Type<Schema<A>, any>; };
export type SchemaContext<S extends Schema<any>> = S extends Schema<infer _, infer Context> ? Context : never;
export type SchemaExtensions<S extends Schema<any>> = S extends Schema<infer _, infer __, infer Extensions> ? Extensions : never;
export type SchemaTypeName<S extends Schema<any>> = S extends Schema<infer _, infer __, infer ___, infer TypeName> ? TypeName : never;
export type TypeOptions = {
    input?: any;
    object?: any;
    resolvedValue?: {};
    value?: any;
};
export type Type<S extends Schema<any> = Schema<{}, unknown, unknown, unknown>, A extends TypeOptions = {}, Input = A["input"] extends undefined ? unknown : A["input"], Object = A["object"] extends undefined ? unknown : A["object"], ResolvedValue = A["resolvedValue"] extends undefined ? {} : A["resolvedValue"], Value = A["value"] extends undefined ? undefined : A["value"]> = Recursive<SchemaTypeName<S> | (({
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
