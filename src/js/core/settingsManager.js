/**
 * Settings manager for LG Fusion
 * Handles settings UI and configuration
 */

const StorageService = require('../services/storageService');
const TraktService = require('../services/traktService');
const DebridService = require('../services/debridService');
const Logger = require('../utils/logger');

const SettingsManager = {
  isOpen: false,
  element: null,

  /**
   * Initialize settings manager
   */
  init() {
    this.createSettingsUI();
    Logger.info('Settings manager initialized');
  },

  /**
   * Create settings UI
   */
  createSettingsUI() {
    const settings = document.createElement('div');
    settings.id = 'settings-panel';
    settings.className = 'settings-panel';
    settings.style.position = 'fixed';
    settings.style.top = '0';
    settings.style.left = '0';
    settings.style.width = '100%';
    settings.style.height = '100%';
    settings.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
    settings.style.zIndex = '20000';
    settings.style.display = 'none';
    settings.style.flexDirection = 'column';
    settings.style.alignItems = 'center';
    settings.style.justifyContent = 'center';

    settings.innerHTML = `
      <div class="settings-content" style="
        background-color: #1c2331;
        border-radius: 12px;
        padding: 40px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h2 style="margin-bottom: 24px; font-size: 32px;">Settings</h2>

        <div class="settings-section" style="margin-bottom: 32px;">
          <h3 style="margin-bottom: 16px; font-size: 24px;">Trakt</h3>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px;">Status:</label>
            <span id="trakt-status">Not authenticated</span>
          </div>
          <button id="trakt-auth-btn" class="settings-btn focusable" style="
            padding: 12px 24px;
            background-color: #007aff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
          ">Authenticate with Trakt</button>
        </div>

        <div class="settings-section" style="margin-bottom: 32px;">
          <h3 style="margin-bottom: 16px; font-size: 24px;">Debrid Provider</h3>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px;">Provider:</label>
            <select id="debrid-provider" class="settings-input focusable" style="
              padding: 12px;
              background-color: #2a3447;
              color: white;
              border: 1px solid #3a4457;
              border-radius: 8px;
              font-size: 16px;
              width: 100%;
            ">
              <option value="real-debrid">Real-Debrid</option>
              <option value="premiumize">Premiumize</option>
              <option value="alldebrid">AllDebrid</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px;">API Key:</label>
            <input type="text" id="debrid-api-key" class="settings-input focusable" placeholder="Enter API key" style="
              padding: 12px;
              background-color: #2a3447;
              color: white;
              border: 1px solid #3a4457;
              border-radius: 8px;
              font-size: 16px;
              width: 100%;
            ">
          </div>
          <button id="debrid-save-btn" class="settings-btn focusable" style="
            padding: 12px 24px;
            background-color: #007aff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
          ">Save Debrid Configuration</button>
        </div>

        <div class="settings-section" style="margin-bottom: 32px;">
          <h3 style="margin-bottom: 16px; font-size: 24px;">Configuration URL</h3>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px;">Starter Kit URL:</label>
            <input type="text" id="config-url" class="settings-input focusable" placeholder="https://raw.githubusercontent.com/..." style="
              padding: 12px;
              background-color: #2a3447;
              color: white;
              border: 1px solid #3a4457;
              border-radius: 8px;
              font-size: 16px;
              width: 100%;
            ">
          </div>
          <button id="config-save-btn" class="settings-btn focusable" style="
            padding: 12px 24px;
            background-color: #007aff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
          ">Save Configuration</button>
        </div>

        <div class="settings-section" style="margin-bottom: 32px;">
          <h3 style="margin-bottom: 16px; font-size: 24px;">Add-on URLs</h3>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px;">Stremio/Cyberflix Add-on URLs (one per line):</label>
            <textarea id="addon-urls" class="settings-input focusable" placeholder="https://stremio-addon-url.com&#10;https://cyberflix-addon-url.com" style="
              padding: 12px;
              background-color: #2a3447;
              color: white;
              border: 1px solid #3a4457;
              border-radius: 8px;
              font-size: 16px;
              width: 100%;
              min-height: 100px;
              resize: vertical;
            "></textarea>
          </div>
          <button id="addon-save-btn" class="settings-btn focusable" style="
            padding: 12px 24px;
            background-color: #007aff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
          ">Save Add-on URLs</button>
        </div>

        <button id="settings-close-btn" class="settings-btn focusable" style="
          padding: 12px 24px;
          background-color: #3a4457;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        ">Close Settings</button>
      </div>
    `;

    document.body.appendChild(settings);
    this.element = settings;

    this.setupEventListeners();
    this.loadSavedSettings();
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Trakt authentication
    document.getElementById('trakt-auth-btn').addEventListener('click', () => {
      this.authenticateTrakt();
    });

    // Debrid save
    document.getElementById('debrid-save-btn').addEventListener('click', () => {
      this.saveDebridConfig();
    });

    // Config URL save
    document.getElementById('config-save-btn').addEventListener('click', () => {
      this.saveConfigUrl();
    });

    // Add-on URLs save
    document.getElementById('addon-save-btn').addEventListener('click', () => {
      this.saveAddonUrls();
    });

    // Close settings
    document.getElementById('settings-close-btn').addEventListener('click', () => {
      this.close();
    });
  },

  /**
   * Load saved settings
   */
  loadSavedSettings() {
    // Load Trakt status
    if (TraktService.isAuthenticated()) {
      document.getElementById('trakt-status').textContent = 'Authenticated';
      document.getElementById('trakt-status').style.color = '#34c759';
    }

    // Load Debrid config
    const debridKeys = StorageService.getItem('debrid_keys') || {};
    if (debridKeys['real-debrid']) {
      document.getElementById('debrid-provider').value = 'real-debrid';
      document.getElementById('debrid-api-key').value = debridKeys['real-debrid'];
    } else if (debridKeys['premiumize']) {
      document.getElementById('debrid-provider').value = 'premiumize';
      document.getElementById('debrid-api-key').value = debridKeys['premiumize'];
    }

    // Load config URL
    const configUrl = StorageService.getItem('config_url');
    if (configUrl) {
      document.getElementById('config-url').value = configUrl;
    }

    // Load addon URLs
    const addonUrls = StorageService.getItem('addon_urls');
    if (addonUrls && Array.isArray(addonUrls)) {
      document.getElementById('addon-urls').value = addonUrls.join('\n');
    }
  },

  /**
   * Authenticate with Trakt
   */
  async authenticateTrakt() {
    try {
      const deviceCode = await TraktService.requestDeviceCode();

      // Show device code to user
      alert(`Visit ${deviceCode.verification_url} and enter code: ${deviceCode.user_code}`);

      // Poll for access token
      await TraktService.pollForAccessToken(deviceCode.device_code, deviceCode.interval);

      // Update UI
      document.getElementById('trakt-status').textContent = 'Authenticated';
      document.getElementById('trakt-status').style.color = '#34c759';

      Logger.info('Trakt authentication successful');
    } catch (error) {
      Logger.error('Trakt authentication failed:', error);
      alert('Authentication failed: ' + error.message);
    }
  },

  /**
   * Save Debrid configuration
   */
  saveDebridConfig() {
    const provider = document.getElementById('debrid-provider').value;
    const apiKey = document.getElementById('debrid-api-key').value;

    if (!apiKey) {
      alert('Please enter an API key');
      return;
    }

    DebridService.setApiKey(provider, apiKey);
    alert('Debrid configuration saved');
    Logger.info(`Debrid configuration saved for ${provider}`);
  },

  /**
   * Save configuration URL
   */
  saveConfigUrl() {
    const configUrl = document.getElementById('config-url').value;

    if (!configUrl) {
      alert('Please enter a configuration URL');
      return;
    }

    StorageService.setItem('config_url', configUrl);
    alert('Configuration URL saved');
    Logger.info('Configuration URL saved');
  },

  /**
   * Save add-on URLs
   */
  saveAddonUrls() {
    const addonUrlsText = document.getElementById('addon-urls').value;

    if (!addonUrlsText.trim()) {
      alert('Please enter at least one add-on URL');
      return;
    }

    const addonUrls = addonUrlsText.split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    StorageService.setItem('addon_urls', addonUrls);
    alert(`Saved ${addonUrls.length} add-on URL(s)`);
    Logger.info(`Saved ${addonUrls.length} add-on URL(s)`);
  },

  /**
   * Open settings
   */
  open() {
    if (this.element) {
      this.element.style.display = 'flex';
      this.isOpen = true;
      Logger.info('Settings opened');
    }
  },

  /**
   * Close settings
   */
  close() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isOpen = false;
      Logger.info('Settings closed');
    }
  },

  /**
   * Toggle settings
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsManager;
}
