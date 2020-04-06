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
     * The backup of the target of the interceptor.
     */
    private backup: T;

    /**
     * The target of the interceptor.
     */
    private target: T;

    /**
     * The proxy that invokes the interceptions.
     */
    private proxy: T;

    /**
     * The interceptions.
     */
    private interceptions: InterceptionCollection<T> = new InterceptionCollection();

    /**
     * A value indicating whether the interceptor is dispoed.
     */
    private disposed: boolean;

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

        this.proxy = new Proxy<T>(
            this.target,
            {
                get: (target: T, property: keyof T): Partial<T>[keyof T] =>
                {
                    if (!this.Disposed)
                    {
                        return this.interceptions.get(property)?.(target, property) ?? target[property];
                    }
                    else
                    {
                        return this.backup[property];
                    }
                }
            });
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
     * Gets the proxy for intercepting calls.
     */
    public get Proxy(): T
    {
        return this.proxy;
    }

    /**
     * Gets a value indicating whether the interceptor is dispoed.
     */
    public get Disposed(): boolean
    {
        return this.disposed;
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
     * Disposes the interceptor.
     */
    public Dispose(): void
    {
        this.disposed = true;
        this.interceptions.clear();
        this.target = undefined;
    }
}
