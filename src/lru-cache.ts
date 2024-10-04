/**
 * A Least Recently Used (LRU) cache with Time-to-Live (TTL) support. Items are kept in the cache until they either
 * reach their TTL or the cache reaches its size and/or item limit. When the limit is exceeded, the cache evicts the
 * item that was least recently accessed (based on the timestamp of access). Items are also automatically evicted if they
 * are expired, as determined by the TTL.
 * An item is considered accessed, and its last accessed timestamp is updated, whenever `has`, `get`, or `set` is called with its key.
 *
 * Implement the LRU cache provider here and use the lru-cache.test.ts to check your implementation.
 * You're encouraged to add additional functions that make working with the cache easier for consumers.
 */

type LRUCacheProviderOptions = {
  ttl: number // Time to live in milliseconds
  itemLimit: number
}
type LRUCacheProvider<T> = {
  has: (key: string) => boolean
  get: (key: string) => T | undefined
  set: (key: string, value: T) => void
}
type LRUCacheItemProvider = {
  key: string
  value: any
  lastAccessTime: number
  isExpired: boolean
}

class LRUCacheItem implements LRUCacheItemProvider {
  key: string = ''
  value: any = {}
  lastAccessTime: number = performance.now() + performance.timeOrigin
  isExpired: boolean = false
}

// TODO: Implement LRU cache provider
export function createLRUCacheProvider<T>({
  ttl,
  itemLimit,
}: LRUCacheProviderOptions): LRUCacheProvider<T> {
  let _cacheStore: LRUCacheItem[] = []

  setTimeout(cleanCacheStore, ttl)

  function cleanCacheStore() {
    let currentTime = performance.now() + performance.timeOrigin

    for (let i = 0; i < _cacheStore.length; i++) {
      let cacheItem = _cacheStore[i]
      let cacheItemExpirationTime = cacheItem.lastAccessTime + ttl
      let timeDiff = cacheItemExpirationTime - currentTime

      if (timeDiff <= 0) {
        cacheItem.isExpired = true
      }
    }

    _cacheStore = _cacheStore.filter((p) => !p.isExpired)

    setTimeout(cleanCacheStore, ttl)
  }

  function evictLeastAccessedItems() {
    _cacheStore = _cacheStore.sort((a, b) => b.lastAccessTime - a.lastAccessTime)

    _cacheStore.pop()
  }

  function getCacheItem(key: string) {
    let cacheItem = _cacheStore.find((p) => p.key == key)

    if (cacheItem) {
      cacheItem.lastAccessTime = performance.now() + performance.timeOrigin

      return cacheItem
    } else return undefined
  }

  return {
    has: (key: string) => {
      let cacheItem = getCacheItem(key)

      if (cacheItem) {
        return true
      } else return false
    },
    get: (key: string) => {
      let cacheItem = getCacheItem(key)

      if (cacheItem) {
        return cacheItem.value
      } else return undefined
    },
    set: (key: string, value: T) => {
      let cacheItem = getCacheItem(key)

      if (cacheItem) {
        cacheItem.value = value
      } else {
        cacheItem = new LRUCacheItem()

        cacheItem.key = key
        cacheItem.value = value

        if (_cacheStore.length == itemLimit) {
          evictLeastAccessedItems()
        }
  
        _cacheStore.push(cacheItem)
      }
    },
  }
}
