// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/7ccc70e89f23369cd0f4a01a4795ca78ad1867b1/lru-cache/lru-cache.d.ts
declare module 'lru-cache' {
	function LRU<T>(opts: LRU.Options<T>): LRU.Cache<T>;
	function LRU<T>(max: number): LRU.Cache<T>;

	namespace LRU {
		interface Options<T> {
			max?: number;
			maxAge?: number;
			length?: (value: T) => number;
			dispose?: (key: any, value: T) => void;
			stale?: boolean;
		}

		interface Cache<T> {
			set(key: any, value: T, maxAge?: number): void;
			get(key: any): T;
			peek(key: any): T;
			has(key: any): boolean
			del(key: any): void;
			reset(): void;
			prune(): void;
			forEach(iter: (value: T, key: any, cache: Cache<T>) => void, thisp?: any): void;
			itemCount: number;
			length: number
			keys(): any[];
			values(): T[];
		}
	}

	export = LRU;
}
