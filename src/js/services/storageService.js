/**
 * Local storage service for LG Fusion
 * Wraps webOS local storage for configs, cache, and preferences
 */

const Logger = require('../utils/logger');

const StorageService = {
  /**
   * Set item in local storage
   */
  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      Logger.debug(`Stored: ${key}`);
      return true;
    } catch (error) {
      Logger.error(`Failed to store ${key}:`, error);
      return false;
    }
  },

  /**
   * Get item from local storage
   */
  getItem(key, defaultValue = null) {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) {
        return defaultValue;
      }
      return JSON.parse(serialized);
    } catch (error) {
      Logger.error(`Failed to retrieve ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * Remove item from local storage
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      Logger.debug(`Removed: ${key}`);
      return true;
    } catch (error) {
      Logger.error(`Failed to remove ${key}:`, error);
      return false;
    }
  },

  /**
   * Clear all items from local storage
   */
  clear() {
    try {
      localStorage.clear();
      Logger.debug('Cleared all storage');
      return true;
    } catch (error) {
      Logger.error('Failed to clear storage:', error);
      return false;
    }
  },

  /**
   * Cache API response with TTL
   */
  setCache(key, data, ttlSeconds = 3600) {
    const cacheItem = {
      data: data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    };
    return this.setItem(`cache_${key}`, cacheItem);
  },

  /**
   * Get cached response if not expired
   */
  getCache(key) {
    const cacheItem = this.getItem(`cache_${key}`);
    if (!cacheItem) {
      return null;
    }

    const now = Date.now();
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      Logger.debug(`Cache expired: ${key}`);
      this.removeItem(`cache_${key}`);
      return null;
    }

    Logger.debug(`Cache hit: ${key}`);
    return cacheItem.data;
  },

  /**
   * Clear expired cache items
   */
  clearExpiredCache() {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const cacheItem = JSON.parse(localStorage.getItem(key));
          if (cacheItem && now - cacheItem.timestamp > cacheItem.ttl) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Invalid cache item, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => this.removeItem(key));
    Logger.debug(`Cleared ${keysToRemove.length} expired cache items`);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
}
