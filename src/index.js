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
 *   input?: any;
 *   object?: any;
 *   resolvedValue?: {};
 *   typeName?: string | unknown;
 *   value?: any;
 * }} TypeOptions
 */

/**
 * @typedef {{
 *   context: unknown;
 *   extensions: {};
 *   input: unknown;
 *   object: unknown;
 *   resolvedValue: {};
 *   typeName: unknown;
 *   value: unknown;
 * }} DefaultTypeOptions
 */

/**
 * @template {TypeOptions} Obj
 * @template {keyof TypeOptions} Key
 * @typedef {undefined extends Obj[Key] ? DefaultTypeOptions[Key] : Obj[Key]} GetTypeOption
 */

/**
 * @template {TypeOptions} O
 * @typedef {Pick<O, 'context' | 'extensions' | 'typeName'>} SharedTypeOptions
 */

/**
 * @template {TypeOptions} [O=DefaultTypeOptions] Default is
 *   `DefaultTypeOptions`
 * @typedef {Recursive<
 *   | GetTypeOption<O, 'typeName'>
 *   | ((
 *       | { optional: Type<SharedTypeOptions<O>> }
 *       | { nullable: Type<SharedTypeOptions<O>> }
 *       | {
 *           arrayOf: Type<SharedTypeOptions<O>>;
 *           minLength?: number;
 *           maxLength?: number;
 *         }
 *       | {
 *           oneOf: { [K: string]: Type<SharedTypeOptions<O>> };
 *           resolveType: (value: {}) => string;
 *         }
 *       | {
 *           object: { [K: string]: Type<SharedTypeOptions<O>> };
 *           defaultType?: Type<SharedTypeOptions<O>>;
 *         }
 *       | {
 *           input?: Type<SharedTypeOptions<O>>;
 *           type?: Type<SharedTypeOptions<O>>;
 *           typeInput?: any;
 *           resolve?:
 *             | ((options: {
 *                 context: GetTypeOption<O, 'context'>;
 *                 input: GetTypeOption<O, 'input'>;
 *                 object: GetTypeOption<O, 'object'>;
 *                 path: string[];
 *                 query: Query;
 *                 schema: Schema<SharedTypeOptions<O>>;
 *                 type: Type<SharedTypeOptions<O>>;
 *                 value: GetTypeOption<O, 'typeName'>;
 *               }) => any)
 *             | {}
 *             | null;
 *         }
 *     ) & {
 *       cost?:
 *         | number
 *         | ((options: {
 *             context: GetTypeOption<O, 'context'>;
 *             cost: number;
 *             input: GetTypeOption<O, 'input'>;
 *             object: GetTypeOption<O, 'object'>;
 *             path: string[];
 *             query: Query;
 *             schema: Schema<SharedTypeOptions<O>>;
 *             type: Type<SharedTypeOptions<O>>;
 *             value: GetTypeOption<O, 'typeName'>;
 *           }) => number);
 *       defaultValue?: any;
 *       validate?: (options: {
 *         context: GetTypeOption<O, 'context'>;
 *         input: GetTypeOption<O, 'input'>;
 *         object: GetTypeOption<O, 'object'>;
 *         path: string[];
 *         query: Query;
 *         schema: Schema<SharedTypeOptions<O>>;
 *         type: Type<SharedTypeOptions<O>>;
 *         value: GetTypeOption<O, 'resolvedValue'>;
 *       }) => any;
 *     } & GetTypeOption<O, 'extensions'>)
 * >} Type
 */

/**
 * @template {TypeOptions} [O=DefaultTypeOptions] Default is
 *   `DefaultTypeOptions`
 * @typedef {GetTypeOption<O, 'typeName'> extends string
 *     ? { [K in GetTypeOption<O, 'typeName'>]: Type<SharedTypeOptions<O>> }
 *     : { [K in keyof any]: never }} Schema
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
