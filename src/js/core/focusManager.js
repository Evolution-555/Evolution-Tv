/**
 * Focus manager for LG Fusion
 * Handles D-pad navigation and focus state management
 */

const Logger = require('../utils/logger');
const StreamSelector = require('./streamSelector');

const FocusManager = {
  focusedElement: null,
  focusableElements: [],
  streamSelector: null,

  /**
   * Initialize focus manager
   */
  init() {
    this.setupRemoteControlListeners();
    this.scanFocusableElements();

    // Initialize stream selector
    this.streamSelector = StreamSelector;
    this.streamSelector.init();

    Logger.info('Focus manager initialized');
  },

  /**
   * Setup remote control event listeners
   */
  setupRemoteControlListeners() {
    // webOS remote control events
    document.addEventListener('keydown', (event) => {
      this.handleKeyPress(event);
    });
  },

  /**
   * Scan DOM for focusable elements
   */
  scanFocusableElements() {
    this.focusableElements = Array.from(document.querySelectorAll('.focusable'));
    Logger.debug(`Found ${this.focusableElements.length} focusable elements`);
  },

  /**
   * Handle key press from remote control
   */
  handleKeyPress(event) {
    const key = event.key;

    switch (key) {
      case 'ArrowUp':
        this.navigate('up');
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.navigate('down');
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.navigate('left');
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.navigate('right');
        event.preventDefault();
        break;
      case 'Enter':
        this.activate();
        event.preventDefault();
        break;
      case 'Backspace':
      case 'Escape':
        this.goBack();
        event.preventDefault();
        break;
      default:
        // Ignore other keys
        break;
    }
  },

  /**
   * Navigate in a direction
   */
  navigate(direction) {
    if (!this.focusedElement) {
      // If no element is focused, focus the first one
      if (this.focusableElements.length > 0) {
        this.focus(this.focusableElements[0]);
      }
      return;
    }

    const currentIndex = this.focusableElements.indexOf(this.focusedElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (direction) {
      case 'up':
        nextIndex = this.findNearestInDirection(currentIndex, 'up');
        break;
      case 'down':
        nextIndex = this.findNearestInDirection(currentIndex, 'down');
        break;
      case 'left':
        nextIndex = this.findNearestInDirection(currentIndex, 'left');
        break;
      case 'right':
        nextIndex = this.findNearestInDirection(currentIndex, 'right');
        break;
    }

    if (nextIndex !== -1 && nextIndex !== currentIndex) {
      this.focus(this.focusableElements[nextIndex]);
    }
  },

  /**
   * Find nearest element in a direction
   */
  findNearestInDirection(currentIndex, direction) {
    const currentRect = this.focusableElements[currentIndex].getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2
    };

    let bestIndex = -1;
    let bestDistance = Infinity;

    for (let i = 0; i < this.focusableElements.length; i++) {
      if (i === currentIndex) continue;

      const rect = this.focusableElements[i].getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      let isInDirection = false;
      let distance = Infinity;

      switch (direction) {
        case 'up':
          isInDirection = center.y < currentCenter.y;
          distance = Math.abs(center.y - currentCenter.y) + Math.abs(center.x - currentCenter.x) * 0.5;
          break;
        case 'down':
          isInDirection = center.y > currentCenter.y;
          distance = Math.abs(center.y - currentCenter.y) + Math.abs(center.x - currentCenter.x) * 0.5;
          break;
        case 'left':
          isInDirection = center.x < currentCenter.x;
          distance = Math.abs(center.x - currentCenter.x) + Math.abs(center.y - currentCenter.y) * 0.5;
          break;
        case 'right':
          isInDirection = center.x > currentCenter.x;
          distance = Math.abs(center.x - currentCenter.x) + Math.abs(center.y - currentCenter.y) * 0.5;
          break;
      }

      if (isInDirection && distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    return bestIndex;
  },

  /**
   * Focus an element
   */
  focus(element) {
    // Remove focus from current element
    if (this.focusedElement) {
      this.focusedElement.classList.remove('focused');
    }

    // Add focus to new element
    this.focusedElement = element;
    element.classList.add('focused');

    // Scroll into view if needed
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });

    Logger.debug(`Focused element: ${element.className}`);
  },

  /**
   * Activate focused element
   */
  activate() {
    if (!this.focusedElement) return;

    Logger.debug(`Activated element: ${this.focusedElement.className}`);

    // Check if it's a media card
    if (this.focusedElement.dataset.imdbId) {
      const imdbId = this.focusedElement.dataset.imdbId;
      Logger.info(`Opening stream selector for: ${imdbId}`);
      this.streamSelector.open(imdbId);
      return;
    }

    // Dispatch click event for other elements
    const clickEvent = new Event('click', { bubbles: true });
    this.focusedElement.dispatchEvent(clickEvent);
  },

  /**
   * Go back
   */
  goBack() {
    Logger.debug('Back button pressed');
    // TODO: Implement back navigation logic
  },

  /**
   * Refresh focusable elements list
   */
  refresh() {
    this.scanFocusableElements();
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FocusManager;
}
