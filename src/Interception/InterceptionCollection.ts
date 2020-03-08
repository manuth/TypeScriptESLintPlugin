/**
 * Represents a collection of interceptions.
 */
export class InterceptionCollection<T extends object> extends Map<keyof T, Interception<T, keyof T>>
{
    /**
     * Gets an interception of the collection.
     *
     * @param key
     * The key whose value to get.
     */
    public get<TKey extends keyof T>(key: TKey): Interception<T, TKey>
    {
        return super.get(key as keyof T) as Interception<T, TKey>;
    }

    /**
     * Sets an interception of the collection.
     *
     * @param key
     * The key whose value to set.
     *
     * @param value
     * The value to set.
     */
    public set<TKey extends keyof T>(key: TKey, value: Interception<T, TKey>): this
    {
        return super.set(key, value);
    }
}

/**
 * Represents an interception.
 */
type Interception<T, TKey extends keyof T> = (taget: T, key: TKey) => T[TKey];
