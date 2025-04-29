const { app } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const profileManager = require('./src/profileManager');
const proxyManager = require('./src/proxyManager');
const workflowExecutor = require('./src/workflowExecutor');
const { setupIpcHandlers } = require('./src/api');

/**
 * Initialize the application data directory
 */
async function initDataDirectory() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Create subdirectories
    await fs.mkdir(path.join(dataDir, 'screenshots'), { recursive: true });
    await fs.mkdir(path.join(dataDir, 'downloads'), { recursive: true });
    
    console.log('Data directory initialized:', dataDir);
  } catch (error) {
    console.error('Failed to initialize data directory:', error);
  }
}

/**
 * Initialize all backend services
 */
async function initBackendServices() {
  try {
    console.log('Initializing backend services...');
    
    await initDataDirectory();
    
    // Initialize managers/services in parallel
    await Promise.all([
      profileManager.initProfiles(),
      proxyManager.initProxies(),
      workflowExecutor.initWorkflows()
    ]);
    
    console.log('Backend services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize backend services:', error);
  }
}

/**
 * Setup backend API and IPC handlers
 * @param {Object} ipcMain - Electron's ipcMain object
 * @param {Object} mainWindow - The main BrowserWindow instance
 */
function setupBackendApi(ipcMain, mainWindow) {
  console.log('Setting up backend API...');
  
  // Initialize backend services
  initBackendServices()
    .then(() => {
      // Setup IPC handlers after services are initialized
      setupIpcHandlers(ipcMain, mainWindow, profileManager, proxyManager, workflowExecutor);
      console.log('Backend API setup complete');
    })
    .catch(error => {
      console.error('Error during backend setup:', error);
    });
  
  // Clean up on app quit
  app.on('before-quit', async () => {
    try {
      console.log('Cleaning up before quit...');
      await profileManager.closeAllProfiles();
      console.log('All profiles closed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });
}

module.exports = {
  setupBackendApi
};
