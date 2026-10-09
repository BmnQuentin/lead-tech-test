// Cache générique avec TTL, pourra être branché sur Redis plus tard
class Cache {
  constructor(ttl) {
    this.ttl = ttl
    this.store = {}
  }

  get(key) {
    const entry = this.store[key]
    if (!entry) return null
    if (Date.now() > entry.expires) {
      delete this.store[key]
      return null
    }
    return entry.value
  }

  set(key, value) {
    this.store[key] = { value: value, expires: Date.now() + this.ttl * 1000 }
  }

  invalidate(key) {
    delete this.store[key]
  }

  invalidateAll() {
    this.store = {}
  }
}

module.exports = Cache
