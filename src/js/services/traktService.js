/**
 * Trakt service for LG Fusion
 * Handles OAuth 2.0 Device Code flow, metadata fetching, and scrobbling
 */

const ApiClient = require('../utils/apiClient');
const StorageService = require('./storageService');
const Logger = require('../utils/logger');

// TODO: Register at https://trakt.tv/oauth/applications
const TRAKT_CLIENT_ID = 'YOUR_CLIENT_ID'; // TODO: Replace with actual client ID
const TRAKT_CLIENT_SECRET = 'YOUR_CLIENT_SECRET'; // TODO: Replace with actual client secret
const TRAKT_API_BASE = 'https://api.trakt.tv';

const TraktService = {
  /**
   * OAuth 2.0 Device Code flow - Step 1: Request device code
   */
  async requestDeviceCode() {
    const url = 'https://trakt.tv/oauth/device/code';
    const data = {
      client_id: TRAKT_CLIENT_ID
    };

    try {
      const response = await ApiClient.post(url, data);
      Logger.info('Device code received:', response.device_code);
      return response;
    } catch (error) {
      Logger.error('Failed to request device code:', error);
      throw error;
    }
  },

  /**
   * OAuth 2.0 Device Code flow - Step 2: Poll for access token
   */
  async pollForAccessToken(deviceCode, interval = 5) {
    const url = 'https://trakt.tv/oauth/device/token';
    const data = {
      client_id: TRAKT_CLIENT_ID,
      client_secret: TRAKT_CLIENT_SECRET,
      code: deviceCode
    };

    const pollInterval = interval * 1000; // Convert to milliseconds

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const response = await ApiClient.post(url, data);
          Logger.info('Access token received');
          StorageService.setItem('trakt_token', response);
          resolve(response);
        } catch (error) {
          if (error.message.includes('pending')) {
            // Still pending, poll again
            setTimeout(poll, pollInterval);
          } else if (error.message.includes('expired')) {
            reject(new Error('Device code expired'));
          } else {
            reject(error);
          }
        }
      };

      poll();
    });
  },

  /**
   * Get access token from storage
   */
  getAccessToken() {
    const tokenData = StorageService.getItem('trakt_token');
    return tokenData ? tokenData.access_token : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  },

  /**
   * Make authenticated API request
   */
  async authenticatedRequest(endpoint, options = {}) {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('Not authenticated with Trakt');
    }

    const url = `${TRAKT_API_BASE}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'trakt-api-version': '2',
      'trakt-api-key': TRAKT_CLIENT_ID,
      ...options.headers
    };

    return ApiClient.get(url, { headers });
  },

  /**
   * Fetch user's movie progress (currently watching)
   */
  async fetchMovieProgress() {
    try {
      const response = await this.authenticatedRequest('/sync/watched/movies');
      Logger.info('Fetched user movie progress');
      return response;
    } catch (error) {
      Logger.error('Failed to fetch movie progress:', error);
      throw error;
    }
  },

  /**
   * Fetch user's show progress (currently watching shows)
   */
  async fetchShowProgress() {
    try {
      const response = await this.authenticatedRequest('/sync/watched/shows');
      Logger.info('Fetched user show progress');
      return response;
    } catch (error) {
      Logger.error('Failed to fetch show progress:', error);
      throw error;
    }
  },

  /**
   * Fetch user's watchlist (movies and shows)
   */
  async fetchWatchlist() {
    try {
      const response = await this.authenticatedRequest('/sync/watchlist');
      Logger.info('Fetched user watchlist');
      return response;
    } catch (error) {
      Logger.error('Failed to fetch watchlist:', error);
      throw error;
    }
  },

  /**
   * Fetch trending shows
   */
  async fetchTrendingShows() {
    try {
      const response = await this.authenticatedRequest('/shows/trending');
      Logger.info('Fetched trending shows');
      return response;
    } catch (error) {
      Logger.error('Failed to fetch trending shows:', error);
      throw error;
    }
  },

  /**
   * Fetch trending movies
   */
  async fetchTrendingMovies() {
    try {
      const response = await this.authenticatedRequest('/movies/trending');
      Logger.info('Fetched trending movies');
      return response;
    } catch (error) {
      Logger.error('Failed to fetch trending movies:', error);
      throw error;
    }
  },

  /**
   * Fetch show details by ID
   */
  async fetchShowDetails(showId) {
    try {
      const response = await this.authenticatedRequest(`/shows/${showId}?extended=full`);
      Logger.info(`Fetched show details: ${showId}`);
      return response;
    } catch (error) {
      Logger.error(`Failed to fetch show details ${showId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch show seasons
   */
  async fetchShowSeasons(showId) {
    try {
      const response = await this.authenticatedRequest(`/shows/${showId}/seasons?extended=full`);
      Logger.info(`Fetched seasons for show: ${showId}`);
      return response;
    } catch (error) {
      Logger.error(`Failed to fetch seasons for show ${showId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch season episodes
   */
  async fetchSeasonEpisodes(showId, seasonNumber) {
    try {
      const response = await this.authenticatedRequest(`/shows/${showId}/seasons/${seasonNumber}?extended=full`);
      Logger.info(`Fetched episodes for show ${showId} season ${seasonNumber}`);
      return response;
    } catch (error) {
      Logger.error(`Failed to fetch episodes for show ${showId} season ${seasonNumber}:`, error);
      throw error;
    }
  },

  /**
   * Fetch next episode to watch for a show
   */
  async fetchNextEpisode(showId) {
    try {
      const response = await this.authenticatedRequest(`/shows/${showId}/next_episode`);
      Logger.info(`Fetched next episode for show: ${showId}`);
      return response;
    } catch (error) {
      Logger.error(`Failed to fetch next episode for show ${showId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch custom user list
   */
  async fetchUserList(listId) {
    try {
      const response = await this.authenticatedRequest(`/users/me/lists/${listId}/items`);
      Logger.info(`Fetched user list: ${listId}`);
      return response;
    } catch (error) {
      Logger.error(`Failed to fetch list ${listId}:`, error);
      throw error;
    }
  },

  /**
   * Search for media by IMDB ID
   */
  async searchByImdbId(imdbId) {
    try {
      const response = await this.authenticatedRequest(`/search/imdb/${imdbId}`);
      Logger.info(`Searched for IMDB ID: ${imdbId}`);
      return response;
    } catch (error) {
      Logger.error(`Failed to search for IMDB ID ${imdbId}:`, error);
      throw error;
    }
  },

  /**
   * Scrobble movie playback start
   */
  async scrobbleMovieStart(imdbId, progress = 0) {
    try {
      const data = {
        movie: {
          ids: { imdb: imdbId }
        },
        progress: progress
      };
      const response = await ApiClient.post(
        `${TRAKT_API_BASE}/scrobble/start`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.getAccessToken()}`,
            'trakt-api-version': '2',
            'trakt-api-key': TRAKT_CLIENT_ID
          }
        }
      );
      Logger.info(`Scrobble movie start: ${imdbId}`);
      return response;
    } catch (error) {
      Logger.error('Failed to scrobble movie start:', error);
      throw error;
    }
  },

  /**
   * Scrobble episode playback start
   */
  async scrobbleEpisodeStart(showId, seasonNumber, episodeNumber, progress = 0) {
    try {
      const data = {
        show: {
          ids: { trakt: showId }
        },
        episode: {
          season: seasonNumber,
          number: episodeNumber
        },
        progress: progress
      };
      const response = await ApiClient.post(
        `${TRAKT_API_BASE}/scrobble/start`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.getAccessToken()}`,
            'trakt-api-version': '2',
            'trakt-api-key': TRAKT_CLIENT_ID
          }
        }
      );
      Logger.info(`Scrobble episode start: S${seasonNumber}E${episodeNumber}`);
      return response;
    } catch (error) {
      Logger.error('Failed to scrobble episode start:', error);
      throw error;
    }
  },

  /**
   * Scrobble movie playback progress
   */
  async scrobbleMovieProgress(imdbId, progress) {
    try {
      const data = {
        movie: {
          ids: { imdb: imdbId }
        },
        progress: progress
      };
      const response = await ApiClient.post(
        `${TRAKT_API_BASE}/scrobble/stop`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.getAccessToken()}`,
            'trakt-api-version': '2',
            'trakt-api-key': TRAKT_CLIENT_ID
          }
        }
      );
      Logger.info(`Scrobble movie progress: ${imdbId} at ${progress}%`);
      return response;
    } catch (error) {
      Logger.error('Failed to scrobble movie progress:', error);
      throw error;
    }
  },

  /**
   * Scrobble episode playback progress
   */
  async scrobbleEpisodeProgress(showId, seasonNumber, episodeNumber, progress) {
    try {
      const data = {
        show: {
          ids: { trakt: showId }
        },
        episode: {
          season: seasonNumber,
          number: episodeNumber
        },
        progress: progress
      };
      const response = await ApiClient.post(
        `${TRAKT_API_BASE}/scrobble/stop`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.getAccessToken()}`,
            'trakt-api-version': '2',
            'trakt-api-key': TRAKT_CLIENT_ID
          }
        }
      );
      Logger.info(`Scrobble episode progress: S${seasonNumber}E${episodeNumber} at ${progress}%`);
      return response;
    } catch (error) {
      Logger.error('Failed to scrobble episode progress:', error);
      throw error;
    }
  },

  /**
   * Scrobble movie complete (90% threshold)
   */
  async scrobbleMovieComplete(imdbId) {
    return this.scrobbleMovieProgress(imdbId, 100);
  },

  /**
   * Scrobble episode complete (90% threshold)
   */
  async scrobbleEpisodeComplete(showId, seasonNumber, episodeNumber) {
    return this.scrobbleEpisodeProgress(showId, seasonNumber, episodeNumber, 100);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TraktService;
}
