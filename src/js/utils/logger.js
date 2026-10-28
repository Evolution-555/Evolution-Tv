/**
 * Logger utility for LG Fusion
 * Provides console logging with levels and optional remote logging
 */

const Logger = {
  levels: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  },

  currentLevel: 1, // Default to INFO

  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.currentLevel = this.levels[level];
    }
  },

  debug(message, ...args) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  info(message, ...args) {
    if (this.currentLevel <= this.levels.INFO) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  warn(message, ...args) {
    if (this.currentLevel <= this.levels.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error(message, ...args) {
    if (this.currentLevel <= this.levels.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}
