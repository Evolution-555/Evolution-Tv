/**
 * Configuration loader for LG Fusion
 * Fetches remote JSON configuration kits and caches locally
 */

const ApiClient = require('../utils/apiClient');
const StorageService = require('./storageService');
const Logger = require('../utils/logger');

const ConfigLoader = {
  /**
   * Fetch configuration from remote URL
   */
  async fetchConfig(configUrl) {
    Logger.info(`Fetching config from: ${configUrl}`);

    try {
      const config = await ApiClient.get(configUrl);
      Logger.info('Config fetched successfully');

      // Cache the config locally
      StorageService.setItem('app_config', config);
      StorageService.setItem('config_url', configUrl);

      return config;
    } catch (error) {
      Logger.error('Failed to fetch config:', error);

      // Fall back to cached config if available
      const cachedConfig = StorageService.getItem('app_config');
      if (cachedConfig) {
        Logger.info('Using cached config');
        return cachedConfig;
      }

      throw new Error('Failed to fetch config and no cache available');
    }
  },

  /**
   * Get cached configuration
   */
  getCachedConfig() {
    return StorageService.getItem('app_config');
  },

  /**
   * Validate configuration structure
   */
  validateConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid config: not an object');
    }

    if (!config.widgets || !Array.isArray(config.widgets)) {
      throw new Error('Invalid config: missing or invalid widgets array');
    }

    // Validate each widget
    config.widgets.forEach((widget, index) => {
      if (!widget.id || !widget.type) {
        throw new Error(`Invalid widget at index ${index}: missing id or type`);
      }

      if (!widget.layout || typeof widget.layout !== 'object') {
        throw new Error(`Invalid widget ${widget.id}: missing or invalid layout`);
      }

      const { x, y, w, h } = widget.layout;
      if (typeof x !== 'number' || typeof y !== 'number' ||
          typeof w !== 'number' || typeof h !== 'number') {
        throw new Error(`Invalid widget ${widget.id}: layout must have numeric x, y, w, h`);
      }
    });

    Logger.info('Config validation passed');
    return true;
  },

  /**
   * Get widget by ID
   */
  getWidgetById(config, widgetId) {
    if (!config || !config.widgets) {
      return null;
    }
    return config.widgets.find(w => w.id === widgetId);
  },

  /**
   * Get all widgets of a specific type
   */
  getWidgetsByType(config, type) {
    if (!config || !config.widgets) {
      return [];
    }
    return config.widgets.filter(w => w.type === type);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigLoader;
}
