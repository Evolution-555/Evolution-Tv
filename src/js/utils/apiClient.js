/**
 * HTTP client with retry logic for LG Fusion
 * Handles fetch with timeout, retry, and error parsing
 */

const Logger = require('./logger');

const ApiClient = {
  defaultTimeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second

  /**
   * Fetch with timeout
   */
  async fetchWithTimeout(url, options = {}, timeout = this.defaultTimeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  },

  /**
   * Fetch with retry logic
   */
  async fetchWithRetry(url, options = {}, retries = this.maxRetries) {
    let lastError;

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await this.fetchWithTimeout(url, options);
        return response;
      } catch (error) {
        lastError = error;
        Logger.warn(`Request failed (attempt ${i + 1}/${retries + 1}):`, error.message);

        if (i < retries) {
          await this.delay(this.retryDelay * (i + 1)); // Exponential backoff
        }
      }
    }

    throw lastError;
  },

  /**
   * Parse JSON response
   */
  async parseJsonResponse(response) {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error.message}`);
    }
  },

  /**
   * GET request
   */
  async get(url, options = {}) {
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'GET'
    });
    return this.parseJsonResponse(response);
  },

  /**
   * POST request
   */
  async post(url, data, options = {}) {
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data)
    });
    return this.parseJsonResponse(response);
  },

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiClient;
}
