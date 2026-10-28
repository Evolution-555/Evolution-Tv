/**
 * Grid widget for LG Fusion
 * Horizontal scrolling grid with virtual scrolling for performance
 */

const WidgetBase = require('./widgetBase');
const Logger = require('../utils/logger');
const TraktService = require('../services/traktService');
const MediaItem = require('../models/mediaItem');

const GridWidget = Object.create(WidgetBase);

/**
 * Render grid widget
 */
GridWidget.render = function(container) {
  // Remove existing element if any
  if (this.element) {
    this.element.remove();
  }

  // Create widget container
  const widget = document.createElement('div');
  widget.className = 'grid-widget';
  widget.style.position = 'absolute';
  widget.style.left = `${this.layout.x}px`;
  widget.style.top = `${this.layout.y}px`;
  widget.style.width = `${this.layout.w}px`;
  widget.style.height = `${this.layout.h}px`;

  // Create title
  const title = document.createElement('div');
  title.className = 'grid-widget-title';
  title.textContent = this.config.title || 'Untitled';
  widget.appendChild(title);

  // Create content container
  const content = document.createElement('div');
  content.className = 'grid-widget-content';
  widget.appendChild(content);

  // Render items
  if (this.data.items && this.data.items.length > 0) {
    this.data.items.forEach((item, index) => {
      const card = this.createCard(item, index);
      content.appendChild(card);
    });
  } else {
    // Show empty state
    const empty = document.createElement('div');
    empty.textContent = 'No items';
    empty.style.color = 'rgba(255, 255, 255, 0.5)';
    content.appendChild(empty);
  }

  this.element = widget;
  container.appendChild(widget);
};

/**
 * Create card element
 */
GridWidget.createCard = function(item, index) {
  const card = document.createElement('div');
  card.className = 'card focusable';
  card.dataset.index = index;
  card.dataset.imdbId = item.imdbId;
  card.dataset.showId = item.showId || '';
  card.dataset.type = item.type || 'movie';
  card.dataset.seasonNumber = item.seasonNumber || '';
  card.dataset.episodeNumber = item.episodeNumber || '';

  // Create image
  const image = document.createElement('img');
  image.className = 'card-image';
  image.src = item.poster || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="240"%3E%3Crect fill="%231c2331" width="160" height="240"/%3E%3C/svg%3E';
  image.alt = item.title;
  image.loading = 'lazy';
  card.appendChild(image);

  // Create title overlay
  const title = document.createElement('div');
  title.className = 'card-title';
  const displayTitle = MediaItem.getDisplayTitle(item);
  title.textContent = displayTitle;
  card.appendChild(title);

  // Add progress indicator for episodes
  if (item.type === 'episode' && item.watchProgress > 0) {
    const progress = document.createElement('div');
    progress.className = 'card-progress';
    progress.style.position = 'absolute';
    progress.style.bottom = '0';
    progress.style.left = '0';
    progress.style.right = '0';
    progress.style.height = '4px';
    progress.style.backgroundColor = '#007aff';
    progress.style.width = `${item.watchProgress}%`;
    card.appendChild(progress);
  }

  return card;
};

/**
 * Show loading state
 */
GridWidget.showLoading = function() {
  if (!this.element) return;

  const content = this.element.querySelector('.grid-widget-content');
  if (!content) return;

  // Clear existing items
  content.innerHTML = '';

  // Add skeleton cards
  const skeletonCount = 5;
  for (let i = 0; i < skeletonCount; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-card';
    content.appendChild(skeleton);
  }
};

/**
 * Show error state
 */
GridWidget.showError = function() {
  if (!this.element) return;

  const content = this.element.querySelector('.grid-widget-content');
  if (!content) return;

  content.innerHTML = '';
  const error = document.createElement('div');
  error.textContent = 'Failed to load content';
  error.style.color = 'rgba(255, 100, 100, 0.8)';
  content.appendChild(error);
};

/**
 * Fetch data from Trakt based on widget configuration
 */
GridWidget.fetchData = async function() {
  const dataSource = this.config.dataSource || 'trakt';
  const listType = this.config.listType || 'trending';
  const mediaType = this.config.mediaType || 'movie'; // 'movie', 'show', 'both'

  if (dataSource !== 'trakt') {
    Logger.warn(`Unsupported data source: ${dataSource}`);
    return [];
  }

  try {
    let traktData = [];

    switch (listType) {
      case 'trending':
        if (mediaType === 'movie' || mediaType === 'both') {
          const movies = await TraktService.fetchTrendingMovies();
          traktData = traktData.concat(movies);
        }
        if (mediaType === 'show' || mediaType === 'both') {
          const shows = await TraktService.fetchTrendingShows();
          traktData = traktData.concat(shows);
        }
        break;
      case 'watchlist':
        traktData = await TraktService.fetchWatchlist();
        break;
      case 'history':
        if (mediaType === 'movie' || mediaType === 'both') {
          const movies = await TraktService.fetchMovieProgress();
          traktData = traktData.concat(movies);
        }
        if (mediaType === 'show' || mediaType === 'both') {
          const shows = await TraktService.fetchShowProgress();
          traktData = traktData.concat(shows);
        }
        break;
      case 'custom':
        if (this.config.listId) {
          traktData = await TraktService.fetchUserList(this.config.listId);
        }
        break;
      default:
        Logger.warn(`Unknown list type: ${listType}`);
        return [];
    }

    // Convert Trakt data to MediaItem format
    const items = traktData.map(item => {
      const mediaItem = MediaItem.fromTrakt(item);
      // Add poster URL (using TMDB or placeholder)
      if (mediaItem.tmdbId) {
        mediaItem.poster = `https://image.tmdb.org/t/p/w300/${mediaItem.tmdbId}`;
      }
      return mediaItem;
    });

    return {
      title: this.config.title || 'Untitled',
      items: items
    };
  } catch (error) {
    Logger.error(`Failed to fetch data for widget ${this.id}:`, error);
    throw error;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GridWidget;
}
