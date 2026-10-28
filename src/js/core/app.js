/**
 * Main app controller for LG Fusion
 * Manages app lifecycle, initialization, and coordination
 */

const ConfigLoader = require('../services/configLoader');
const LayoutManager = require('./layoutManager');
const FocusManager = require('./focusManager');
const SettingsManager = require('./settingsManager');
const StorageService = require('../services/storageService');
const VideoPlayer = require('../services/videoPlayer');
const Logger = require('../utils/logger');

const App = {
  isInitialized: false,

  /**
   * Initialize app
   */
  async init() {
    if (this.isInitialized) {
      Logger.warn('App already initialized');
      return;
    }

    Logger.info('Initializing LG Fusion app...');

    try {
      // Hide loading overlay initially
      this.hideLoading();

      // Initialize storage
      StorageService.clearExpiredCache();

      // Initialize video player
      VideoPlayer.init();

      // Initialize layout manager
      const widgetContainer = document.getElementById('widget-container');
      LayoutManager.init(widgetContainer);

      // Initialize focus manager
      FocusManager.init();

      // Initialize settings manager
      SettingsManager.init();

      // Setup settings button
      this.setupSettingsButton();

      // Load configuration
      await this.loadConfiguration();

      this.isInitialized = true;
      Logger.info('App initialized successfully');
    } catch (error) {
      Logger.error('Failed to initialize app:', error);
      this.showError('Failed to initialize app');
    }
  },

  /**
   * Setup settings button
   */
  setupSettingsButton() {
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        SettingsManager.open();
      });
    }
  },

  /**
   * Load configuration
   */
  async loadConfiguration() {
    this.showLoading('Loading configuration...');

    try {
      // Check for cached config URL
      const configUrl = StorageService.getItem('config_url');

      if (configUrl) {
        // Fetch from remote URL
        const config = await ConfigLoader.fetchConfig(configUrl);
        ConfigLoader.validateConfig(config);
        await LayoutManager.renderLayout(config);
      } else {
        // Use local config for testing
        Logger.info('Using local configuration');
        const config = require('../config.json');
        ConfigLoader.validateConfig(config);
        await LayoutManager.renderLayout(config);
      }

      // Refresh focusable elements
      FocusManager.refresh();

      this.hideLoading();
    } catch (error) {
      Logger.error('Failed to load configuration:', error);
      this.showError('Failed to load configuration');
    }
  },

  /**
   * Show loading overlay
   */
  showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const text = overlay.querySelector('.loading-text');
    text.textContent = message;
    overlay.classList.remove('hidden');
  },

  /**
   * Hide loading overlay
   */
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('hidden');
  },

  /**
   * Show error message
   */
  showError(message) {
    this.hideLoading();

    const overlay = document.getElementById('loading-overlay');
    const text = overlay.querySelector('.loading-text');
    text.textContent = message;
    text.style.color = '#ff6464';
    overlay.classList.remove('hidden');
  },

  /**
   * Handle app launch
   */
  onLaunch() {
    Logger.info('App launched');
    this.init();
  },

  /**
   * Handle app suspend
   */
  onSuspend() {
    Logger.info('App suspended');
    // Pause any ongoing operations
  },

  /**
   * Handle app resume
   */
  onResume() {
    Logger.info('App resumed');
    // Refresh data if needed
  },

  /**
   * Handle app close
   */
  onClose() {
    Logger.info('App closing');
    // Cleanup
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
