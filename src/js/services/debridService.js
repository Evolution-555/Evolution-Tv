/**
 * Debrid service for LG Fusion
 * Handles Real-Debrid, Premiumize, and AllDebrid integration
 */

const ApiClient = require('../utils/apiClient');
const StorageService = require('./storageService');
const Logger = require('../utils/logger');

const DebridService = {
  providers: {
    'real-debrid': {
      apiBase: 'https://api.real-debrid.com/rest/1.0',
      authUrl: 'https://api.real-debrid.com/oauth/v2/device/code'
    },
    'premiumize': {
      apiBase: 'https://www.premiumize.me/api',
      authUrl: 'https://www.premiumize.me/token'
    },
    'alldebrid': {
      apiBase: 'https://api.alldebrid.com/v4',
      authUrl: 'https://api.alldebrid.com/v4/pin/get'
    }
  },

  /**
   * Set Debrid API key
   */
  setApiKey(provider, apiKey) {
    const keys = StorageService.getItem('debrid_keys') || {};
    keys[provider] = apiKey;
    StorageService.setItem('debrid_keys', keys);
    Logger.info(`Set API key for ${provider}`);
  },

  /**
   * Get Debrid API key
   */
  getApiKey(provider) {
    const keys = StorageService.getItem('debrid_keys') || {};
    return keys[provider] || null;
  },

  /**
   * Check if info hash is cached (Real-Debrid)
   */
  async checkCacheRealDebrid(infoHash) {
    const apiKey = this.getApiKey('real-debrid');
    if (!apiKey) {
      throw new Error('Real-Debrid API key not set');
    }

    try {
      const url = `${this.providers['real-debrid'].apiBase}/torrents/instantAvailability/${infoHash}`;
      const response = await ApiClient.get(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const isCached = response && Object.keys(response).length > 0;
      Logger.info(`Cache check for ${infoHash}: ${isCached ? 'CACHED' : 'NOT CACHED'}`);
      return isCached;
    } catch (error) {
      Logger.error('Failed to check Real-Debrid cache:', error);
      throw error;
    }
  },

  /**
   * Get streaming URL from Real-Debrid
   */
  async getStreamUrlRealDebrid(infoHash) {
    const apiKey = this.getApiKey('real-debrid');
    if (!apiKey) {
      throw new Error('Real-Debrid API key not set');
    }

    try {
      // Add torrent to Real-Debrid
      const addUrl = `${this.providers['real-debrid'].apiBase}/torrents/addMagnet`;
      const magnetUri = `magnet:?xt=urn:btih:${infoHash}`;
      const addResponse = await ApiClient.post(addUrl, { magnet: magnetUri }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const torrentId = addResponse.id;

      // Select files (select all)
      const selectUrl = `${this.providers['real-debrid'].apiBase}/torrents/selectFiles/${torrentId}`;
      await ApiClient.post(selectUrl, { files: 'all' }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      // Get torrent info to find streaming link
      const infoUrl = `${this.providers['real-debrid'].apiBase}/torrents/info/${torrentId}`;
      const infoResponse = await ApiClient.get(infoUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      // Find streaming link
      const streamLink = infoResponse.links && infoResponse.links[0];
      if (!streamLink) {
        throw new Error('No streaming link available');
      }

      // Unrestrict link to get direct HTTP URL
      const unrestrictUrl = `${this.providers['real-debrid'].apiBase}/unrestrict/link`;
      const unrestrictResponse = await ApiClient.post(unrestrictUrl, { link: streamLink }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      Logger.info(`Got streaming URL for ${infoHash}`);
      return unrestrictResponse.download;
    } catch (error) {
      Logger.error('Failed to get Real-Debrid stream URL:', error);
      throw error;
    }
  },

  /**
   * Check cache for Premiumize
   */
  async checkCachePremiumize(infoHash) {
    const apiKey = this.getApiKey('premiumize');
    if (!apiKey) {
      throw new Error('Premiumize API key not set');
    }

    try {
      const url = `${this.providers['premiumize'].apiBase}/transfer/directdl`;
      const response = await ApiClient.post(url, {
        src: `magnet:?xt=urn:btih:${infoHash}`
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const isCached = response && response.content && response.content.length > 0;
      Logger.info(`Cache check for ${infoHash}: ${isCached ? 'CACHED' : 'NOT CACHED'}`);
      return isCached;
    } catch (error) {
      Logger.error('Failed to check Premiumize cache:', error);
      throw error;
    }
  },

  /**
   * Get streaming URL from Premiumize
   */
  async getStreamUrlPremiumize(infoHash) {
    const apiKey = this.getApiKey('premiumize');
    if (!apiKey) {
      throw new Error('Premiumize API key not set');
    }

    try {
      const url = `${this.providers['premiumize'].apiBase}/transfer/directdl`;
      const response = await ApiClient.post(url, {
        src: `magnet:?xt=urn:btih:${infoHash}`
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.content || response.content.length === 0) {
        throw new Error('No streaming link available');
      }

      Logger.info(`Got streaming URL for ${infoHash}`);
      return response.content[0].link;
    } catch (error) {
      Logger.error('Failed to get Premiumize stream URL:', error);
      throw error;
    }
  },

  /**
   * Generic cache check (auto-detect provider)
   */
  async checkCache(infoHash, provider = 'real-debrid') {
    switch (provider) {
      case 'real-debrid':
        return this.checkCacheRealDebrid(infoHash);
      case 'premiumize':
        return this.checkCachePremiumize(infoHash);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  },

  /**
   * Generic stream URL getter (auto-detect provider)
   */
  async getStreamUrl(infoHash, provider = 'real-debrid') {
    switch (provider) {
      case 'real-debrid':
        return this.getStreamUrlRealDebrid(infoHash);
      case 'premiumize':
        return this.getStreamUrlPremiumize(infoHash);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DebridService;
}
