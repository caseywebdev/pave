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
 * @template {string} TypeName
 * @template {{ [K: string]: any }} Extensions
 * @template Context
 * @typedef {{
 *   [K in TypeName]: Type<
 *     Schema<TypeName, Extensions, Context>,
 *     any,
 *     any,
 *     any,
 *     any
 *   >;
 * }} Schema
 */

/**
 * @template {Schema<any, any, any>} S
 * @typedef {S extends Schema<infer TypeName, any, any> ? TypeName : never} SchemaTypeName
 */

/**
 * @template {Schema<any, any, any>} S
 * @typedef {S extends Schema<any, infer Extensions, any> ? Extensions : never} SchemaExtensions
 */

/**
 * @template {Schema<any, any, any>} S
 * @typedef {S extends Schema<any, any, infer Context> ? Context : never} SchemaContext
 */

/**
 * @template {Schema<any, any, any>} [S=Schema<never, {}, unknown>] Default is
 *   `Schema<never, {}, unknown>`
 * @template [Input=unknown] Default is `unknown`
 * @template [Object=unknown] Default is `unknown`
 * @template [Value=unknown] Default is. Default is `unknown`
 * @template [ResolvedValue=NonNullable<unknown>] Default is
 *   `NonNullable<unknown>`
 * @typedef {Recursive<
 *   | SchemaTypeName<S>
 *   | ((
 *       | { optional: Type<S> }
 *       | { nullable: Type<S> }
 *       | { arrayOf: Type<S>; minLength?: number; maxLength?: number }
 *       | {
 *           oneOf: { [K: string]: Type<S> };
 *           resolveType: (value: NonNullable<unknown>) => string;
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
