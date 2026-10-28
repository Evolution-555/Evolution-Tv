/**
 * Layout manager for LG Fusion
 * Parses JSON layout definitions and renders widgets
 */

const GridWidget = require('../widgets/gridWidget');
const ListWidget = require('../widgets/listWidget');
const Logger = require('../utils/logger');

const LayoutManager = {
  widgets: [],
  container: null,

  /**
   * Initialize layout manager
   */
  init(container) {
    this.container = container;
    Logger.info('Layout manager initialized');
  },

  /**
   * Render layout from configuration
   */
  async renderLayout(config) {
    if (!config || !config.widgets) {
      Logger.error('Invalid config: missing widgets');
      return;
    }

    // Clear existing widgets
    this.clearWidgets();

    // Render each widget
    for (const widgetConfig of config.widgets) {
      try {
        await this.renderWidget(widgetConfig);
      } catch (error) {
        Logger.error(`Failed to render widget ${widgetConfig.id}:`, error);
      }
    }

    Logger.info(`Rendered ${this.widgets.length} widgets`);
  },

  /**
   * Render a single widget
   */
  async renderWidget(config) {
    let widget;

    switch (config.type) {
      case 'grid':
        widget = Object.create(GridWidget);
        break;
      case 'list':
        widget = Object.create(ListWidget);
        break;
      default:
        Logger.warn(`Unknown widget type: ${config.type}`);
        return;
    }

    // Initialize widget with config
    widget.config = config;
    widget.init(config);

    // Show loading state
    widget.showLoading();
    widget.render(this.container);

    // Fetch data
    try {
      const data = await widget.fetchData();
      widget.data = data;
      widget.render(this.container);
    } catch (error) {
      Logger.error(`Failed to fetch data for widget ${config.id}:`, error);
      widget.showError();
    }

    // Start auto-refresh if configured
    if (config.refreshInterval > 0) {
      widget.startAutoRefresh();
    }

    // Store widget reference
    this.widgets.push(widget);
  },

  /**
   * Clear all widgets
   */
  clearWidgets() {
    this.widgets.forEach(widget => {
      widget.destroy();
    });
    this.widgets = [];
    this.container.innerHTML = '';
    Logger.debug('Cleared all widgets');
  },

  /**
   * Get widget by ID
   */
  getWidgetById(id) {
    return this.widgets.find(w => w.id === id);
  },

  /**
   * Refresh all widgets
   */
  refreshAll() {
    this.widgets.forEach(widget => {
      widget.refresh();
    });
    Logger.info('Refreshed all widgets');
  },

  /**
   * Refresh specific widget
   */
  refreshWidget(id) {
    const widget = this.getWidgetById(id);
    if (widget) {
      widget.refresh();
      Logger.info(`Refreshed widget: ${id}`);
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayoutManager;
}
