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
 * @template {SchemaOptions} [O={}] Default is `{}`
 * @template [_Context=O['context'] extends undefined ? unknown: O['context']]
 *   Default is `O['context'] extends undefined ? unknown: O['context']`
 * @template [_Extensions=O['extensions'] extends undefined ? {} : O['extensions']]
 *   Default is `O['extensions'] extends undefined ? {} : O['extensions']`
 * @template [TypeName=O['typeName'] extends string ? O['typeName'] : never]
 *   Default is `O['typeName'] extends string ? O['typeName'] : never`
 * @typedef {{
 *   [K in TypeName extends string ? TypeName : never]: Type<Schema<O>, any>;
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
 * @template {TypeOptions} [O={}] Default is `{}`
 * @template [Input=O['input'] extends undefined ? unknown : O['input']]
 *   Default is `O['input'] extends undefined ? unknown : O['input']`
 * @template [Object=O['object'] extends undefined ? unknown : O['object']]
 *   Default is `O['object'] extends undefined ? unknown : O['object']`
 * @template [ResolvedValue=O['resolvedValue'] extends undefined ? {} : O['resolvedValue']]
 *   Default is `O['resolvedValue'] extends undefined ? {} : O['resolvedValue']`
 * @template [Value=O['value'] extends undefined ? undefined : O['value']]
 *   Default is `O['value'] extends undefined ? undefined : O['value']`
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
