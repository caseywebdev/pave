/**
 * @template T
 * @typedef {T | RecursiveArray<T>} Recursive
 */

/**
 * @template T
 * @typedef {Recursive<T>[]} RecursiveArray
 */

/**
 * @template Value
 * @template Fallback
 * @typedef {undefined extends Value ? Fallback : Value} Get
 */

/**
 * @typedef {{
 *   context?: any;
 *   extensions?: {};
 *   input?: any;
 *   object?: any;
 *   resolvedValue?: {};
 *   typeName?: string;
 *   value?: any;
 * }} TypeOptions
 */

/**
 * @template {TypeOptions} O
 * @typedef {Type<{
 *   context: O['context'];
 *   extensions: O['extensions'];
 *   typeName: O['typeName'];
 * }>} SubType
 */

/**
 * @template {TypeOptions} [O={}] Default is `{}`
 * @typedef {Recursive<
 *   | (O['typeName'] extends string ? O['typeName'] : never)
 *   | ((
 *       | { optional: SubType<O> }
 *       | { nullable: SubType<O> }
 *       | { arrayOf: SubType<O>; minLength?: number; maxLength?: number }
 *       | {
 *           oneOf: { [K: string]: SubType<O> };
 *           resolveType: (value: {}) => string;
 *         }
 *       | {
 *           object: { [K: string]: SubType<O> } | SubType<O>[];
 *           defaultType?: SubType<O>;
 *         }
 *       | {
 *           input?: SubType<O>;
 *           type?: SubType<O>;
 *           typeInput?: any;
 *           resolve?:
 *             | ((options: {
 *                 context: Get<O['context'], any>;
 *                 input: Get<O['input'], any>;
 *                 object: Get<O['object'], any>;
 *                 path: string[];
 *                 query: Query;
 *                 schema: Schema<O>;
 *                 type: SubType<O>;
 *                 value: Get<O['value'], any>;
 *               }) => any)
 *             | {}
 *             | null;
 *         }
 *     ) & {
 *       cost?:
 *         | number
 *         | ((options: {
 *             context: Get<O['context'], any>;
 *             cost: number;
 *             input: Get<O['input'], any>;
 *             object: Get<O['object'], any>;
 *             path: string[];
 *             query: Query;
 *             schema: Schema<O>;
 *             type: SubType<O>;
 *             value: Get<O['value'], any>;
 *           }) => number);
 *       defaultValue?: any;
 *       validate?: (options: {
 *         context: Get<O['context'], any>;
 *         input: Get<O['input'], any>;
 *         object: Get<O['object'], any>;
 *         path: string[];
 *         query: Query;
 *         schema: Schema<O>;
 *         type: SubType<O>;
 *         value: Get<O['resolvedValue'], any>;
 *       }) => any;
 *     } & Get<O['extensions'], {}>)
 * >} Type
 */

/**
 * @template {TypeOptions} [O={}] Default is `{}`
 * @typedef {O['typeName'] extends string
 *   ? { [K in O['typeName']]: SubType<O> }
 *   : { [K in keyof any]: never }} Schema
 */

/**
 * @typedef {{ _?: string; $?: any; _type?: { [K in keyof any]: never } }
 *   | { [K: string]: Query }} Query
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
