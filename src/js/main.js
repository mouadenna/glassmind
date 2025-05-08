const { app } = require('electron');
const AppController = require('./app-controller');
const logger = require('./utils/logger');

// Main application instance
let appController;

// Initialize the application when Electron is ready
app.whenReady().then(() => {
  logger.info("Application ready, initializing");
  
  // Create and initialize the app controller
  appController = new AppController();
  appController.initialize();
});

// Handle window close events
app.on('window-all-closed', () => {
  logger.info("All windows closed");
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle application reactivation (macOS)
app.on('activate', () => {
  logger.info("Application activated");
  if (!appController) {
    // Create and initialize if not already created
    appController = new AppController();
    appController.initialize();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
}); 