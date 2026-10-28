/**
 * Stream selector for LG Fusion
 * Handles stream selection, addon querying, and Debrid integration
 */

const AddonService = require('../services/addonService');
const DebridService = require('../services/debridService');
const VideoPlayer = require('../services/videoPlayer');
const StorageService = require('../services/storageService');
const StreamInfo = require('../models/streamInfo');
const Logger = require('../utils/logger');

const StreamSelector = {
  isOpen: false,
  element: null,
  currentImdbId: null,
  streams: [],

  /**
   * Initialize stream selector
   */
  init() {
    this.createStreamSelectorUI();
    Logger.info('Stream selector initialized');
  },

  /**
   * Create stream selector UI
   */
  createStreamSelectorUI() {
    const selector = document.createElement('div');
    selector.id = 'stream-selector';
    selector.className = 'stream-selector';
    selector.style.position = 'fixed';
    selector.style.top = '0';
    selector.style.left = '0';
    selector.style.width = '100%';
    selector.style.height = '100%';
    selector.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
    selector.style.zIndex = '15000';
    selector.style.display = 'none';
    selector.style.flexDirection = 'column';
    selector.style.alignItems = 'center';
    selector.style.justifyContent = 'center';

    selector.innerHTML = `
      <div class="stream-selector-content" style="
        background-color: #1c2331;
        border-radius: 12px;
        padding: 40px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h2 style="margin-bottom: 24px; font-size: 32px;">Select Stream</h2>
        <div id="stream-list" style="display: flex; flex-direction: column; gap: 12px;"></div>
        <button id="stream-close-btn" class="stream-btn focusable" style="
          margin-top: 24px;
          padding: 12px 24px;
          background-color: #3a4457;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        ">Cancel</button>
      </div>
    `;

    document.body.appendChild(selector);
    this.element = selector;

    this.setupEventListeners();
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    document.getElementById('stream-close-btn').addEventListener('click', () => {
      this.close();
    });
  },

  /**
   * Open stream selector for a media item
   */
  async open(imdbId) {
    this.currentImdbId = imdbId;
    this.streams = [];

    if (this.element) {
      this.element.style.display = 'flex';
      this.isOpen = true;
    }

    // Show loading
    const streamList = document.getElementById('stream-list');
    streamList.innerHTML = '<div style="color: rgba(255, 255, 255, 0.7);">Loading streams...</div>';

    try {
      // Get addon URLs from storage or use defaults
      const addonUrls = StorageService.getItem('addon_urls') || [
        'https://addon-url-1.com',
        'https://addon-url-2.com'
      ];

      // Query addons
      const streams = await AddonService.queryMultipleAddons(addonUrls, imdbId);
      this.streams = AddonService.sortStreams(streams);

      // Get Debrid provider
      const debridKeys = StorageService.getItem('debrid_keys') || {};
      const debridProvider = Object.keys(debridKeys)[0] || null;

      // Check cache for each stream
      if (debridProvider) {
        for (const stream of this.streams) {
          try {
            const isCached = await DebridService.checkCache(stream.infoHash, debridProvider);
            stream.isCached = isCached;
          } catch (error) {
            Logger.warn(`Failed to check cache for ${stream.infoHash}:`, error);
            stream.isCached = false;
          }
        }
      }

      // Render streams
      this.renderStreams();
    } catch (error) {
      Logger.error('Failed to load streams:', error);
      streamList.innerHTML = '<div style="color: #ff6464;">Failed to load streams</div>';
    }
  },

  /**
   * Render stream list
   */
  renderStreams() {
    const streamList = document.getElementById('stream-list');
    streamList.innerHTML = '';

    if (this.streams.length === 0) {
      streamList.innerHTML = '<div style="color: rgba(255, 255, 255, 0.7);">No streams available</div>';
      return;
    }

    this.streams.forEach((stream, index) => {
      const streamItem = document.createElement('div');
      streamItem.className = 'stream-item focusable';
      streamItem.style.padding = '16px';
      streamItem.style.backgroundColor = stream.isCached ? '#1c3a2e' : '#2a3447';
      streamItem.style.borderRadius = '8px';
      streamItem.style.display = 'flex';
      streamItem.style.justifyContent = 'space-between';
      streamItem.style.alignItems = 'center';
      streamItem.dataset.index = index;

      streamItem.innerHTML = `
        <div>
          <div style="font-size: 18px; font-weight: 600;">${stream.quality || 'Unknown'}</div>
          <div style="font-size: 14px; color: rgba(255, 255, 255, 0.7);">
            ${StreamInfo.formatSize(stream.size)} • ${stream.seeders || 0} seeders
          </div>
        </div>
        <div style="font-size: 14px; color: ${stream.isCached ? '#34c759' : '#ff9500'};">
          ${stream.isCached ? '✓ Cached' : 'Not Cached'}
        </div>
      `;

      streamItem.addEventListener('click', () => {
        this.selectStream(index);
      });

      streamList.appendChild(streamItem);
    });
  },

  /**
   * Select a stream and play it
   */
  async selectStream(index) {
    const stream = this.streams[index];
    if (!stream) return;

    const debridKeys = StorageService.getItem('debrid_keys') || {};
    const debridProvider = Object.keys(debridKeys)[0];

    if (!debridProvider) {
      alert('Please configure a Debrid provider in settings');
      this.close();
      return;
    }

    try {
      // Get streaming URL from Debrid
      const streamUrl = await DebridService.getStreamUrl(stream.infoHash, debridProvider);

      // Play video
      await VideoPlayer.play(streamUrl, this.currentImdbId);

      this.close();
    } catch (error) {
      Logger.error('Failed to play stream:', error);
      alert('Failed to play stream: ' + error.message);
    }
  },

  /**
   * Close stream selector
   */
  close() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isOpen = false;
      this.currentImdbId = null;
      this.streams = [];
      Logger.info('Stream selector closed');
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StreamSelector;
}
