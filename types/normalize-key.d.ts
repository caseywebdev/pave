export function normalizeKey({ alias, query: { _, $ } }: {
    alias: string;
    query: Query;
}): string;
import type { Query } from '#types/index.d.ts';
