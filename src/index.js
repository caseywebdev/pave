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
 * @template {{ [K: string]: any }} [Extensions={}] Default is `{}`
 * @template [Context=unknown] Default is `unknown`
 * @template [Input=unknown] Default is `unknown`
 * @template [Object=unknown] Default is `unknown`
 * @template [Value=unknown] Default is. Default is `unknown`
 * @template [ResolvedValue=NonNullable<unknown>] Default is
 *   `NonNullable<unknown>`
 * @typedef {Recursive<
 *   | TypeName
 *   | ((
 *       | { optional: Type<TypeName, Extensions, Context> }
 *       | { nullable: Type<TypeName, Extensions, Context> }
 *       | {
 *           arrayOf: Type<TypeName, Extensions, Context>;
 *           minLength?: number;
 *           maxLength?: number;
 *         }
 *       | {
 *           oneOf: { [K: string]: Type<TypeName, Extensions, Context> };
 *           resolveType: (value: NonNullable<unknown>) => string;
 *         }
 *       | {
 *           object: { [K: string]: Type<TypeName, Extensions, Context> };
 *           defaultType?: Type<TypeName, Extensions, Context>;
 *         }
 *       | {
 *           input?: Type<TypeName, Extensions, Context>;
 *           type?: Type<TypeName, Extensions, Context>;
 *           typeInput?: any;
 *           resolve?:
 *             | ((options: {
 *                 context: Context;
 *                 input: Input;
 *                 object: Object;
 *                 path: string[];
 *                 query: Query;
 *                 schema: Schema<TypeName, Extensions, Context>;
 *                 type: Type<TypeName, Extensions, Context>;
 *                 value: Value;
 *               }) => any)
 *             | {}
 *             | null;
 *         }
 *     ) & {
 *       cost?:
 *         | number
 *         | ((options: {
 *             context: Context;
 *             cost: number;
 *             input: Input;
 *             object: Object;
 *             path: string[];
 *             query: Query;
 *             schema: Schema<TypeName, Extensions, Context>;
 *             type: Type<TypeName, Extensions, Context>;
 *             value: Value;
 *           }) => number);
 *       defaultValue?: any;
 *       validate?: (options: {
 *         context: Context;
 *         input: Input;
 *         object: Object;
 *         path: string[];
 *         query: Query;
 *         schema: Schema<TypeName, Extensions, Context>;
 *         type: Type<TypeName, Extensions, Context>;
 *         value: ResolvedValue;
 *       }) => any;
 *     } & Extensions)
 * >} Type
 */

/**
 * @template {string} TypeName
 * @template {{ [K: string]: any }} Extensions
 * @template Context
 * @typedef {{
 *   [K in TypeName]: Type<TypeName, Extensions, Context, any, any, any, any>;
 * }} Schema
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
