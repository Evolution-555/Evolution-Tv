/**
 * Base widget class for LG Fusion
 * Abstract interface for all widget types
 */

const Logger = require('../utils/logger');

const WidgetBase = {
  /**
   * Initialize widget
   */
  init(config) {
    this.id = config.id;
    this.type = config.type;
    this.layout = config.layout;
    this.data = config.data || {};
    this.refreshInterval = config.refreshInterval || 0;
    this.refreshTimer = null;
    this.element = null;
    this.isLoading = false;

    Logger.debug(`Initialized widget: ${this.id} (${this.type})`);
  },

  /**
   * Render widget to DOM
   */
  render(container) {
    // Override in subclasses
    Logger.warn(`render() not implemented for widget: ${this.id}`);
  },

  /**
   * Fetch data for widget
   */
  async fetchData() {
    // Override in subclasses
    Logger.warn(`fetchData() not implemented for widget: ${this.id}`);
    return [];
  },

  /**
   * Refresh widget data
   */
  async refresh() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.showLoading();

    try {
      const data = await this.fetchData();
      this.data = data;
      this.render(this.element.parentElement);
    } catch (error) {
      Logger.error(`Failed to refresh widget ${this.id}:`, error);
      this.showError();
    } finally {
      this.isLoading = false;
    }
  },

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    if (this.refreshInterval > 0 && !this.refreshTimer) {
      this.refreshTimer = setInterval(() => {
        this.refresh();
      }, this.refreshInterval * 1000);
      Logger.debug(`Auto-refresh started for widget: ${this.id} (${this.refreshInterval}s)`);
    }
  },

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      Logger.debug(`Auto-refresh stopped for widget: ${this.id}`);
    }
  },

  /**
   * Show loading state
   */
  showLoading() {
    // Override in subclasses
  },

  /**
   * Show error state
   */
  showError() {
    // Override in subclasses
  },

  /**
   * Destroy widget
   */
  destroy() {
    this.stopAutoRefresh();
    if (this.element) {
      this.element.remove();
    }
    Logger.debug(`Destroyed widget: ${this.id}`);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WidgetBase;
}
