/**
 * List widget for LG Fusion
 * Vertical list with focus support
 */

const WidgetBase = require('./widgetBase');
const Logger = require('../utils/logger');
const TraktService = require('../services/traktService');
const MediaItem = require('../models/mediaItem');

const ListWidget = Object.create(WidgetBase);

/**
 * Render list widget
 */
ListWidget.render = function(container) {
  // Remove existing element if any
  if (this.element) {
    this.element.remove();
  }

  // Create widget container
  const widget = document.createElement('div');
  widget.className = 'list-widget';
  widget.style.position = 'absolute';
  widget.style.left = `${this.layout.x}px`;
  widget.style.top = `${this.layout.y}px`;
  widget.style.width = `${this.layout.w}px`;
  widget.style.height = `${this.layout.h}px`;
  widget.style.overflowY = 'auto';

  // Add title if configured
  if (this.config.title) {
    const title = document.createElement('div');
    title.className = 'grid-widget-title';
    title.textContent = this.config.title;
    widget.appendChild(title);
  }

  // Render items
  if (this.data.items && this.data.items.length > 0) {
    this.data.items.forEach((item, index) => {
      const listItem = this.createListItem(item, index);
      widget.appendChild(listItem);
    });
  } else {
    // Show empty state
    const empty = document.createElement('div');
    empty.textContent = 'No items';
    empty.style.color = 'rgba(255, 255, 255, 0.5)';
    empty.style.padding = '12px';
    widget.appendChild(empty);
  }

  this.element = widget;
  container.appendChild(widget);
};

/**
 * Create list item element
 */
ListWidget.createListItem = function(item, index) {
  const listItem = document.createElement('div');
  listItem.className = 'list-item focusable';
  listItem.dataset.index = index;
  listItem.dataset.imdbId = item.imdbId;

  // Create poster
  const poster = document.createElement('img');
  poster.className = 'list-item-poster';
  poster.src = item.poster || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="90"%3E%3Crect fill="%231c2331" width="60" height="90"/%3E%3C/svg%3E';
  poster.alt = item.title;
  poster.loading = 'lazy';
  listItem.appendChild(poster);

  // Create info container
  const info = document.createElement('div');
  info.className = 'list-item-info';

  // Create title
  const title = document.createElement('div');
  title.className = 'list-item-title';
  title.textContent = item.title;
  info.appendChild(title);

  // Create metadata
  const meta = document.createElement('div');
  meta.className = 'list-item-meta';
  const metaText = [item.year, item.rating].filter(Boolean).join(' • ');
  meta.textContent = metaText;
  info.appendChild(meta);

  listItem.appendChild(info);

  return listItem;
};

/**
 * Show loading state
 */
ListWidget.showLoading = function() {
  if (!this.element) return;

  // Clear existing items
  this.element.innerHTML = '';

  // Add skeleton items
  const skeletonCount = 3;
  for (let i = 0; i < skeletonCount; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton skeleton-list-item';
    this.element.appendChild(skeleton);
  }
};

/**
 * Show error state
 */
ListWidget.showError = function() {
  if (!this.element) return;

  this.element.innerHTML = '';
  const error = document.createElement('div');
  error.textContent = 'Failed to load content';
  error.style.color = 'rgba(255, 100, 100, 0.8)';
  error.style.padding = '12px';
  this.element.appendChild(error);
};

/**
 * Fetch data from Trakt based on widget configuration
 */
ListWidget.fetchData = async function() {
  const dataSource = this.config.dataSource || 'trakt';
  const listType = this.config.listType || 'history';
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
  module.exports = ListWidget;
}
