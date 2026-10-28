/**
 * Media item model for Evolution TV
 * Represents a movie, TV show, or episode with metadata
 */

const MediaItem = {
  /**
   * Create a media item
   */
  create(data) {
    return {
      id: data.id || null,
      title: data.title || 'Unknown',
      year: data.year || null,
      poster: data.poster || null,
      backdrop: data.backdrop || null,
      imdbId: data.imdbId || null,
      tmdbId: data.tmdbId || null,
      tvdbId: data.tvdbId || null,
      type: data.type || 'movie', // 'movie', 'show', 'episode', 'season'
      rating: data.rating || null,
      overview: data.overview || null,
      genres: data.genres || [],
      runtime: data.runtime || null,
      releaseDate: data.releaseDate || null,
      // TV show specific
      showId: data.showId || null,
      season: data.season || null,
      episode: data.episode || null,
      episodeTitle: data.episodeTitle || null,
      episodeNumber: data.episodeNumber || null,
      seasonNumber: data.seasonNumber || null,
      watched: data.watched || false,
      watchProgress: data.watchProgress || 0, // percentage
      lastWatched: data.lastWatched || null
    };
  },

  /**
   * Create from Trakt movie response
   */
  fromTraktMovie(traktData) {
    const movie = traktData.movie || traktData;
    return this.create({
      title: movie.title,
      year: movie.year,
      imdbId: movie.ids?.imdb,
      tmdbId: movie.ids?.tmdb,
      rating: traktData.rating || null,
      overview: movie.overview,
      type: 'movie'
    });
  },

  /**
   * Create from Trakt show response
   */
  fromTraktShow(traktData) {
    const show = traktData.show || traktData;
    return this.create({
      title: show.title,
      year: show.year,
      imdbId: show.ids?.imdb,
      tmdbId: show.ids?.tmdb,
      tvdbId: show.ids?.tvdb,
      rating: traktData.rating || null,
      overview: show.overview,
      type: 'show'
    });
  },

  /**
   * Create from Trakt episode response
   */
  fromTraktEpisode(traktData) {
    const episode = traktData.episode || traktData;
    const show = traktData.show;

    return this.create({
      title: show?.title || 'Unknown Show',
      episodeTitle: episode.title,
      year: episode.year || show?.year,
      imdbId: show?.ids?.imdb,
      tmdbId: show?.ids?.tmdb,
      tvdbId: show?.ids?.tvdb,
      rating: traktData.rating || null,
      overview: episode.overview,
      type: 'episode',
      showId: show?.ids?.trakt,
      seasonNumber: episode.season,
      episodeNumber: episode.number,
      watched: traktData.watched || false,
      watchProgress: traktData.progress || 0
    });
  },

  /**
   * Create from Trakt season response
   */
  fromTraktSeason(traktData) {
    const show = traktData.show;
    const season = traktData.season || traktData;

    return this.create({
      title: show?.title || 'Unknown Show',
      year: show?.year,
      imdbId: show?.ids?.imdb,
      tmdbId: show?.ids?.tmdb,
      tvdbId: show?.ids?.tvdb,
      type: 'season',
      showId: show?.ids?.trakt,
      seasonNumber: season.number,
      episodeCount: season.episode_count || 0
    });
  },

  /**
   * Create from Trakt response (auto-detect type)
   */
  fromTrakt(traktData) {
    if (traktData.movie) {
      return this.fromTraktMovie(traktData);
    } else if (traktData.show) {
      if (traktData.episode) {
        return this.fromTraktEpisode(traktData);
      } else if (traktData.season) {
        return this.fromTraktSeason(traktData);
      }
      return this.fromTraktShow(traktData);
    }
    // Fallback to movie
    return this.fromTraktMovie(traktData);
  },

  /**
   * Validate media item
   */
  validate(item) {
    if (!item.title) {
      throw new Error('Media item must have a title');
    }
    if (!item.imdbId && !item.tmdbId && !item.tvdbId) {
      throw new Error('Media item must have either IMDB, TMDB, or TVDB ID');
    }
    return true;
  },

  /**
   * Format episode label (e.g., "S1E5")
   */
  formatEpisodeLabel(item) {
    if (item.type === 'episode' && item.seasonNumber !== null && item.episodeNumber !== null) {
      return `S${item.seasonNumber}E${item.episodeNumber}`;
    }
    return '';
  },

  /**
   * Get display title
   */
  getDisplayTitle(item) {
    if (item.type === 'episode') {
      const episodeLabel = this.formatEpisodeLabel(item);
      return item.episodeTitle ? `${episodeLabel} - ${item.episodeTitle}` : episodeLabel;
    }
    return item.title;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaItem;
}
