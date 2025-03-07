/**
 * @template T
 * @typedef {T | RecursiveArray<T>} Recursive
 */

/**
 * @template T
 * @typedef {Recursive<T>[]} RecursiveArray
 */

/**
 * @typedef {{
 *   context?: any;
 *   extensions?: { [K: string]: any };
 *   typeName?: string;
 * }} SchemaOptions
 */

/**
 * @template {SchemaOptions} [A={}] Default is `{}`
 * @template [_Context=A['context'] extends undefined ? unknown: A['context']]
 *   Default is `A['context'] extends undefined ? unknown: A['context']`
 * @template [_Extensions=A['extensions'] extends undefined ? {} : A['extensions']]
 *   Default is `A['extensions'] extends undefined ? {} : A['extensions']`
 * @template [TypeName=A['typeName'] extends undefined ? never : A['typeName']]
 *   Default is `A['typeName'] extends undefined ? never : A['typeName']`
 * @typedef {{
 *   [K in TypeName extends string ? TypeName : never]: Type<Schema<A>, any>;
 * }} Schema
 */

/**
 * @template {Schema<any>} S
 * @typedef {S extends Schema<infer _, infer Context> ? Context : never} SchemaContext
 */

/**
 * @template {Schema<any>} S
 * @typedef {S extends Schema<infer _, infer __, infer Extensions> ? Extensions : never} SchemaExtensions
 */

/**
 * @template {Schema<any>} S
 * @typedef {S extends Schema<infer _, infer __, infer ___, infer TypeName>
 *     ? TypeName
 *     : never} SchemaTypeName
 */

/** @typedef {{ input?: any; object?: any; resolvedValue?: {}; value?: any }} TypeOptions */

/**
 * @template {Schema<any>} [S=Schema] Default is `Schema`
 * @template {TypeOptions} [A={}] Default is `{}`
 * @template [Input=A['input'] extends undefined ? unknown : A['input']]
 *   Default is `A['input'] extends undefined ? unknown : A['input']`
 * @template [Object=A['object'] extends undefined ? unknown : A['object']]
 *   Default is `A['object'] extends undefined ? unknown : A['object']`
 * @template [ResolvedValue=A['resolvedValue'] extends undefined ? {} : A['resolvedValue']]
 *   Default is `A['resolvedValue'] extends undefined ? {} : A['resolvedValue']`
 * @template [Value=A['value'] extends undefined ? undefined : A['value']]
 *   Default is `A['value'] extends undefined ? undefined : A['value']`
 * @typedef {Recursive<
 *   | SchemaTypeName<S>
 *   | ((
 *       | { optional: Type<S, any> }
 *       | { nullable: Type<S, any> }
 *       | { arrayOf: Type<S, any>; minLength?: number; maxLength?: number }
 *       | {
 *           oneOf: { [K: string]: Type<S, any> };
 *           resolveType: (value: {}) => string;
 *         }
 *       | { object: { [K: string]: Type<S, any> }; defaultType?: Type<S, any> }
 *       | {
 *           input?: Type<S, any>;
 *           type?: Type<S, any>;
 *           typeInput?: any;
 *           resolve?:
 *             | ((options: {
 *                 context: SchemaContext<S>;
 *                 input: Input;
 *                 object: Object;
 *                 path: string[];
 *                 query: Query;
 *                 schema: S;
 *                 type: Type<S, any>;
 *                 value: Value;
 *               }) => any)
 *             | {}
 *             | null;
 *         }
 *     ) & {
 *       cost?:
 *         | number
 *         | ((options: {
 *             context: SchemaContext<S>;
 *             cost: number;
 *             input: Input;
 *             object: Object;
 *             path: string[];
 *             query: Query;
 *             schema: S;
 *             type: Type<S, any>;
 *             value: Value;
 *           }) => number);
 *       defaultValue?: any;
 *       validate?: (options: {
 *         context: SchemaContext<S>;
 *         input: Input;
 *         object: Object;
 *         path: string[];
 *         query: Query;
 *         schema: S;
 *         type: Type<S, any>;
 *         value: ResolvedValue;
 *       }) => any;
 *     } & SchemaExtensions<S>)
 * >} Type
 */

/**
 * @template [T=any] Default is `any`
 * @typedef {{ _?: string; $?: any; _type?: { [K in keyof any]: never } }
 *   | { [K: string]: Query<T> }} Query
 */

export { Context } from '#src/context.js';
export { createClient } from '#src/create-client.js';
export { execute } from '#src/execute.js';
export { getQueryCost } from '#src/get-query-cost.js';
export { injectType } from '#src/inject-type.js';
export { levenshtein } from '#src/levenshtein.js';
export { mergeRefs } from '#src/merge-refs.js';
export { PaveError } from '#src/pave-error.js';
export { validateQuery } from '#src/validate-query.js';
export { validateSchema } from '#src/validate-schema.js';
export { validateValue } from '#src/validate-value.js';
