/**
 * Addon service for LG Fusion
 * Handles Stremio/Cyberflix addon integration for content discovery
 */

const ApiClient = require('../utils/apiClient');
const Logger = require('../utils/logger');

const AddonService = {
  /**
   * Query addon endpoint for streams
   */
  async queryAddon(addonUrl, imdbId, type = 'movie') {
    Logger.info(`Querying addon: ${addonUrl} for IMDB ID: ${imdbId}`);

    try {
      // Construct addon API URL
      const apiUrl = `${addonUrl}/stream/${type}/${imdbId}`;

      const response = await ApiClient.get(apiUrl);
      Logger.info(`Addon query successful: ${response.length} streams found`);

      return response;
    } catch (error) {
      Logger.error('Failed to query addon:', error);
      throw error;
    }
  },

  /**
   * Query multiple addons concurrently
   */
  async queryMultipleAddons(addonUrls, imdbId, type = 'movie') {
    Logger.info(`Querying ${addonUrls.length} addons concurrently`);

    const promises = addonUrls.map(url =>
      this.queryAddon(url, imdbId, type).catch(error => {
        Logger.warn(`Addon query failed for ${url}:`, error.message);
        return [];
      })
    );

    const results = await Promise.all(promises);

    // Flatten and deduplicate results
    const allStreams = results.flat();
    const uniqueStreams = this.deduplicateStreams(allStreams);

    Logger.info(`Total unique streams: ${uniqueStreams.length}`);
    return uniqueStreams;
  },

  /**
   * Deduplicate streams by info hash
   */
  deduplicateStreams(streams) {
    const seen = new Set();
    return streams.filter(stream => {
      if (!stream.infoHash) {
        return false;
      }
      if (seen.has(stream.infoHash)) {
        return false;
      }
      seen.add(stream.infoHash);
      return true;
    });
  },

  /**
   * Sort streams by quality and seeders
   */
  sortStreams(streams) {
    return streams.sort((a, b) => {
      // Prioritize by quality (4K > 1080p > 720p > 480p)
      const qualityOrder = { '4K': 4, '1080p': 3, '720p': 2, '480p': 1 };
      const aQuality = qualityOrder[a.quality] || 0;
      const bQuality = qualityOrder[b.quality] || 0;

      if (aQuality !== bQuality) {
        return bQuality - aQuality;
      }

      // Then by seeders
      const aSeeders = a.seeders || 0;
      const bSeeders = b.seeders || 0;
      return bSeeders - aSeeders;
    });
  },

  /**
   * Parse addon manifest
   */
  async parseAddonManifest(addonUrl) {
    try {
      const manifestUrl = `${addonUrl}/manifest.json`;
      const manifest = await ApiClient.get(manifestUrl);
      Logger.info(`Parsed addon manifest: ${manifest.name}`);
      return manifest;
    } catch (error) {
      Logger.error('Failed to parse addon manifest:', error);
      throw error;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AddonService;
}
