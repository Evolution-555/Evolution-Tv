/**
 * Video player service for LG Fusion
 * Wraps webOS Video API for playback
 */

const Logger = require('../utils/logger');
const TraktService = require('./traktService');

const VideoPlayer = {
  videoElement: null,
  isPlaying: false,
  currentImdbId: null,
  currentShowId: null,
  currentSeasonNumber: null,
  currentEpisodeNumber: null,
  currentType: 'movie', // 'movie' or 'episode'
  scrobbleInterval: null,
  scrobbleProgress: 0,

  /**
   * Initialize video player
   */
  init() {
    // Create video element
    this.videoElement = document.createElement('video');
    this.videoElement.id = 'video-player';
    this.videoElement.style.position = 'fixed';
    this.videoElement.style.top = '0';
    this.videoElement.style.left = '0';
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.zIndex = '10000';
    this.videoElement.style.display = 'none';

    document.body.appendChild(this.videoElement);

    // Setup event listeners
    this.setupEventListeners();

    Logger.info('Video player initialized');
  },

  /**
   * Setup video event listeners
   */
  setupEventListeners() {
    this.videoElement.addEventListener('play', () => {
      this.isPlaying = true;
      Logger.info('Video started playing');
    });

    this.videoElement.addEventListener('pause', () => {
      this.isPlaying = false;
      Logger.info('Video paused');
    });

    this.videoElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.stopScrobbling();
      Logger.info('Video ended');
    });

    this.videoElement.addEventListener('error', (error) => {
      Logger.error('Video error:', error);
      this.stopScrobbling();
    });

    this.videoElement.addEventListener('timeupdate', () => {
      this.updateScrobbleProgress();
    });
  },

  /**
   * Play movie from URL
   */
  async playMovie(url, imdbId) {
    if (!this.videoElement) {
      this.init();
    }

    this.currentImdbId = imdbId;
    this.currentType = 'movie';
    this.scrobbleProgress = 0;

    // Show video player
    this.videoElement.style.display = 'block';
    this.videoElement.src = url;

    try {
      await this.videoElement.play();

      // Start scrobbling
      if (imdbId && TraktService.isAuthenticated()) {
        await TraktService.scrobbleMovieStart(imdbId, 0);
        this.startScrobbling();
      }
    } catch (error) {
      Logger.error('Failed to play movie:', error);
      throw error;
    }
  },

  /**
   * Play episode from URL
   */
  async playEpisode(url, showId, seasonNumber, episodeNumber) {
    if (!this.videoElement) {
      this.init();
    }

    this.currentShowId = showId;
    this.currentSeasonNumber = seasonNumber;
    this.currentEpisodeNumber = episodeNumber;
    this.currentType = 'episode';
    this.scrobbleProgress = 0;

    // Show video player
    this.videoElement.style.display = 'block';
    this.videoElement.src = url;

    try {
      await this.videoElement.play();

      // Start scrobbling
      if (showId && TraktService.isAuthenticated()) {
        await TraktService.scrobbleEpisodeStart(showId, seasonNumber, episodeNumber, 0);
        this.startScrobbling();
      }
    } catch (error) {
      Logger.error('Failed to play episode:', error);
      throw error;
    }
  },

  /**
   * Play video (legacy method for backward compatibility)
   */
  async play(url, imdbId) {
    return this.playMovie(url, imdbId);
  },

  /**
   * Pause video
   */
  pause() {
    if (this.videoElement) {
      this.videoElement.pause();
    }
  },

  /**
   * Resume video
   */
  resume() {
    if (this.videoElement) {
      this.videoElement.play();
    }
  },

  /**
   * Stop video and hide player
   */
  stop() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement.style.display = 'none';
    }

    this.stopScrobbling();
    this.currentImdbId = null;
    this.currentShowId = null;
    this.currentSeasonNumber = null;
    this.currentEpisodeNumber = null;
    this.currentType = 'movie';
    this.isPlaying = false;
  },

  /**
   * Seek to position (seconds)
   */
  seek(seconds) {
    if (this.videoElement) {
      this.videoElement.currentTime = seconds;
    }
  },

  /**
   * Start scrobbling to Trakt
   */
  startScrobbling() {
    this.stopScrobbling(); // Clear any existing interval

    this.scrobbleInterval = setInterval(async () => {
      if (this.isPlaying && this.videoElement) {
        const duration = this.videoElement.duration;
        const currentTime = this.videoElement.currentTime;

        if (duration > 0) {
          this.scrobbleProgress = (currentTime / duration) * 100;

          // Scrobble progress every 30 seconds
          if (Math.floor(currentTime) % 30 === 0) {
            if (this.currentType === 'movie' && this.currentImdbId) {
              await TraktService.scrobbleMovieProgress(this.currentImdbId, this.scrobbleProgress);
            } else if (this.currentType === 'episode' && this.currentShowId) {
              await TraktService.scrobbleEpisodeProgress(
                this.currentShowId,
                this.currentSeasonNumber,
                this.currentEpisodeNumber,
                this.scrobbleProgress
              );
            }
          }

          // Mark as watched at 90%
          if (this.scrobbleProgress >= 90) {
            if (this.currentType === 'movie' && this.currentImdbId) {
              await TraktService.scrobbleMovieComplete(this.currentImdbId);
            } else if (this.currentType === 'episode' && this.currentShowId) {
              await TraktService.scrobbleEpisodeComplete(
                this.currentShowId,
                this.currentSeasonNumber,
                this.currentEpisodeNumber
              );
            }
            this.stopScrobbling();
          }
        }
      }
    }, 1000); // Check every second
  },

  /**
   * Stop scrobbling
   */
  stopScrobbling() {
    if (this.scrobbleInterval) {
      clearInterval(this.scrobbleInterval);
      this.scrobbleInterval = null;
    }
  },

  /**
   * Update scrobble progress
   */
  updateScrobbleProgress() {
    if (this.isPlaying && this.videoElement && this.currentImdbId) {
      const duration = this.videoElement.duration;
      const currentTime = this.videoElement.currentTime;

      if (duration > 0) {
        this.scrobbleProgress = (currentTime / duration) * 100;
      }
    }
  },

  /**
   * Get current playback state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.videoElement ? this.videoElement.currentTime : 0,
      duration: this.videoElement ? this.videoElement.duration : 0,
      progress: this.scrobbleProgress
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoPlayer;
}
