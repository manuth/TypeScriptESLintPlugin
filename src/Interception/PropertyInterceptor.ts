/**
 * Represents an interception for a property.
 */
export type PropertyInterception<T, TKey extends keyof T> = (target: T, property: TKey) => T[TKey];
