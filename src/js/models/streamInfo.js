/**
 * Stream info model for LG Fusion
 * Represents a streaming source with metadata
 */

const StreamInfo = {
  /**
   * Create a stream info object
   */
  create(data) {
    return {
      infoHash: data.infoHash || null,
      quality: data.quality || 'unknown',
      size: data.size || null,
      seeders: data.seeders || 0,
      leechers: data.leechers || 0,
      name: data.name || 'Unknown',
      provider: data.provider || null,
      debridUrl: data.debridUrl || null,
      addonSource: data.addonSource || null
    };
  },

  /**
   * Create from addon response
   */
  fromAddon(addonData, addonSource) {
    return this.create({
      infoHash: addonData.infoHash,
      quality: addonData.quality,
      size: addonData.size,
      seeders: addonData.seeders,
      leechers: addonData.leechers,
      name: addonData.name,
      addonSource: addonSource
    });
  },

  /**
   * Validate stream info
   */
  validate(stream) {
    if (!stream.infoHash) {
      throw new Error('Stream info must have an info hash');
    }
    return true;
  },

  /**
   * Format file size for display
   */
  formatSize(bytes) {
    if (!bytes) return 'Unknown';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StreamInfo;
}
