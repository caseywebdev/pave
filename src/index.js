/**
 * @template [T=any] Default is `any`
 * @typedef {{ _?: string; $?: any; _type?: { [K in keyof any]: never } }
 *   | { [K: string]: Query<T> }} Query
 */

/**
 * @template T
 * @typedef {T | RecursiveArray<T>} Recursive
 */

/**
 * @template T
 * @typedef {Recursive<T>[]} RecursiveArray
 */

/**
 * @template {string} [TypeName=never] Default is `never`
 * @template [Context=unknown] Default is `unknown`
 * @template {{ [K: string]: any }} [Extensions={}] Default is `{}`
 * @typedef {{
 *   [K in TypeName]: Type<
 *     Schema<TypeName, Context, Extensions>,
 *     any,
 *     any,
 *     any,
 *     any
 *   >;
 * }} Schema
 */

/**
 * @template {Schema<any, any, any>} S
 * @typedef {S extends Schema<infer TypeName, infer _, infer __> ? TypeName : never} SchemaTypeName
 */

/**
 * @template {Schema<any, any, any>} S
 * @typedef {S extends Schema<infer _, infer Context, infer __> ? Context : never} SchemaContext
 */

/**
 * @template {Schema<any, any, any>} S
 * @typedef {S extends Schema<infer _, infer __, infer Extensions> ? Extensions : never} SchemaExtensions
 */

/**
 * @template {Schema<any, any, any>} [S=Schema] Default is `Schema`
 * @template [Input=unknown] Default is `unknown`
 * @template [Object=unknown] Default is `unknown`
 * @template [Value=unknown] Default is. Default is `unknown`
 * @template [ResolvedValue={}] Default is `{}`
 * @typedef {Recursive<
 *   | SchemaTypeName<S>
 *   | ((
 *       | { optional: Type<S> }
 *       | { nullable: Type<S> }
 *       | { arrayOf: Type<S>; minLength?: number; maxLength?: number }
 *       | {
 *           oneOf: { [K: string]: Type<S> };
 *           resolveType: (value: {}) => string;
 *         }
 *       | { object: { [K: string]: Type<S> }; defaultType?: Type<S> }
 *       | {
 *           input?: Type<S>;
 *           type?: Type<S>;
 *           typeInput?: any;
 *           resolve?:
 *             | ((options: {
 *                 context: SchemaContext<S>;
 *                 input: Input;
 *                 object: Object;
 *                 path: string[];
 *                 query: Query;
 *                 schema: S;
 *                 type: Type<S>;
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
 *             type: Type<S>;
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
 *         type: Type<S>;
 *         value: ResolvedValue;
 *       }) => any;
 *     } & SchemaExtensions<S>)
 * >} Type
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
