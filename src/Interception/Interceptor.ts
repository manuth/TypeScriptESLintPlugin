import cloneDeep = require("lodash.clonedeep");
import { Interception } from "./Interception";
import { InterceptionCollection } from "./InterceptionCollection";
import { MethodInterception } from "./MethodInterceptor";
import { PropertyInterception } from "./PropertyInterceptor";

/**
 * Provides the functionality to intercept methods of an object.
 */
export class Interceptor<T extends object>
{
    /**
     * The target of the interceptor.
     */
    private target: T;

    /**
     * The interceptions.
     */
    private interceptions: InterceptionCollection<T> = new InterceptionCollection();

    /**
     * Initializes a new instance of the `Interceptor<T>` class.
     *
     * @param target
     * The target of the interceptor.
     *
     * @param freeze
     * A value indicating whether the state of the members .
     */
    public constructor(target: T, freeze?: boolean)
    {
        if (freeze)
        {
            let clone = cloneDeep(target);
            this.target = clone;

            for (let property of Object.getOwnPropertyNames(target))
            {
                if (property in target)
                {
                    Object.defineProperty(
                        this.target,
                        property,
                        Object.getOwnPropertyDescriptor(target, property));
                }
            }

            Object.assign(this.target, { ...clone });
        }
        else
        {
            this.target = target;
        }
    }

    /**
     * Gets the target of the interceptor.
     */
    public get Target(): T
    {
        return this.target;
    }

    /**
     * Gets the installed interceptions.
     */
    public get Interceptions(): ReadonlyMap<keyof T, Interception<T, keyof T>>
    {
        return new Map(this.interceptions);
    }

    /**
     * Adds a new property-interception.
     *
     * @param key
     * The key of the interception to add.
     *
     * @param interception
     * The interception to add.
     */
    public AddProperty<TKey extends keyof T>(key: TKey, interception: PropertyInterception<T, TKey>): void
    {
        if (!this.interceptions.has(key))
        {
            this.interceptions.set(key, (target, key): T[TKey] => interception(target, key));
        }
        else
        {
            throw new RangeError(`An interception with the key \`${key}\` already exists!`);
        }
    }

    /**
     * Adds a new interception.
     *
     * @param key
     * The key of the interception to add.
     *
     * @param interception
     * The interception to add.
     */
    public AddMethod<TKey extends keyof T>(key: TKey, interception: MethodInterception<T, TKey>): void
    {
        this.AddProperty(
            key,
            (target, key): T[TKey] =>
            {
                return ((...args: unknown[]): unknown => interception(target, target[key], ...args)) as any as T[TKey];
            });
    }

    /**
     * Deletes an interception.
     *
     * @param key
     * The key to delete.
     */
    public Delete(key: keyof T): void
    {
        this.interceptions.delete(key);
    }

    /**
     * Creates a proxy-object for the interceptor.
     */
    public CreateProxy(): T
    {
        return new Proxy<T>(
            this.target,
            {
                get: (target: T, property: keyof T): Partial<T>[keyof T] =>
                {
                    return this.interceptions.get(property)?.(target, property) ?? target[property];
                }
            });
    }
}
