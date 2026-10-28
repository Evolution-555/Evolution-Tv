/**
 * Main entry point for LG Fusion
 * Initializes the app when webOS launches it
 */

const App = require('./js/core/app');
const Logger = require('./js/utils/logger');

// Set log level
Logger.setLevel(Logger.levels.INFO);

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  Logger.info('DOM ready, initializing app...');

  // Initialize app
  App.init().catch(error => {
    Logger.error('Failed to initialize app:', error);
  });
});

// Handle webOS app lifecycle events
if (typeof webOS !== 'undefined' && webOS && webOS.event) {
  // App launch
  webOS.event.launch(function (launchData) {
    Logger.info('webOS app launched with data:', launchData);
    App.onLaunch();
  });

  // App suspend
  webOS.event.pause(function () {
    Logger.info('webOS app paused');
    App.onSuspend();
  });

  // App resume
  webOS.event.resume(function () {
    Logger.info('webOS app resumed');
    App.onResume();
  });

  // App close
  webOS.event.close(function () {
    Logger.info('webOS app closing');
    App.onClose();
  });
} else {
  // Not running on webOS (testing in browser)
  Logger.info('Not running on webOS, simulating launch');
  App.onLaunch();
}
