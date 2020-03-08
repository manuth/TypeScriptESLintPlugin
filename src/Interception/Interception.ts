/**
 * Represents an interception.
 */
export type Interception<T, TKey extends keyof T> = (taget: T, key: TKey) => T[TKey];
