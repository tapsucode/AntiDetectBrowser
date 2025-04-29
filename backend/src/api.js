/**
 * Sets up IPC handlers for the backend API
 * @param {Object} ipcMain - Electron's ipcMain object
 * @param {Object} mainWindow - The main BrowserWindow instance
 * @param {Object} profileManager - Profile manager instance
 * @param {Object} proxyManager - Proxy manager instance
 * @param {Object} workflowExecutor - Workflow executor instance
 */
function setupIpcHandlers(ipcMain, mainWindow, profileManager, proxyManager, workflowExecutor) {
  // Profile Management
  ipcMain.handle('profile:create', async (event, profileData) => {
    try {
      return await profileManager.createProfile(profileData);
    } catch (error) {
      console.error('IPC profile:create error:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }
  });
  
  ipcMain.handle('profile:getAll', async () => {
    try {
      return profileManager.getAllProfiles();
    } catch (error) {
      console.error('IPC profile:getAll error:', error);
      throw new Error(`Failed to get profiles: ${error.message}`);
    }
  });
  
  ipcMain.handle('profile:get', async (event, id) => {
    try {
      const profile = profileManager.getProfile(id);
      if (!profile) {
        throw new Error('Profile not found');
      }
      return profile;
    } catch (error) {
      console.error('IPC profile:get error:', error);
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  });
  
  ipcMain.handle('profile:update', async (event, id, profileData) => {
    try {
      return await profileManager.updateProfile(id, profileData);
    } catch (error) {
      console.error('IPC profile:update error:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  });
  
  ipcMain.handle('profile:delete', async (event, id) => {
    try {
      return await profileManager.deleteProfile(id);
    } catch (error) {
      console.error('IPC profile:delete error:', error);
      throw new Error(`Failed to delete profile: ${error.message}`);
    }
  });
  
  ipcMain.handle('profile:launch', async (event, id) => {
    try {
      return await profileManager.launchProfile(id, proxyManager, (updatedProfile) => {
        mainWindow.webContents.send('profile:status', updatedProfile);
      });
    } catch (error) {
      console.error('IPC profile:launch error:', error);
      throw new Error(`Failed to launch profile: ${error.message}`);
    }
  });
  
  // Proxy Management
  ipcMain.handle('proxy:add', async (event, proxyData) => {
    try {
      return await proxyManager.addProxy(proxyData);
    } catch (error) {
      console.error('IPC proxy:add error:', error);
      throw new Error(`Failed to add proxy: ${error.message}`);
    }
  });
  
  ipcMain.handle('proxy:getAll', async () => {
    try {
      return proxyManager.getAllProxies();
    } catch (error) {
      console.error('IPC proxy:getAll error:', error);
      throw new Error(`Failed to get proxies: ${error.message}`);
    }
  });
  
  ipcMain.handle('proxy:get', async (event, id) => {
    try {
      const proxy = proxyManager.getProxy(id);
      if (!proxy) {
        throw new Error('Proxy not found');
      }
      return proxy;
    } catch (error) {
      console.error('IPC proxy:get error:', error);
      throw new Error(`Failed to get proxy: ${error.message}`);
    }
  });
  
  ipcMain.handle('proxy:update', async (event, id, proxyData) => {
    try {
      return await proxyManager.updateProxy(id, proxyData);
    } catch (error) {
      console.error('IPC proxy:update error:', error);
      throw new Error(`Failed to update proxy: ${error.message}`);
    }
  });
  
  ipcMain.handle('proxy:delete', async (event, id) => {
    try {
      return await proxyManager.deleteProxy(id);
    } catch (error) {
      console.error('IPC proxy:delete error:', error);
      throw new Error(`Failed to delete proxy: ${error.message}`);
    }
  });
  
  ipcMain.handle('proxy:test', async (event, id) => {
    try {
      return await proxyManager.testProxy(id, (updatedProxy) => {
        mainWindow.webContents.send('proxy:status', updatedProxy);
      });
    } catch (error) {
      console.error('IPC proxy:test error:', error);
      throw new Error(`Failed to test proxy: ${error.message}`);
    }
  });
  
  // Workflow Management
  ipcMain.handle('workflow:create', async (event, workflowData) => {
    try {
      return await workflowExecutor.createWorkflow(workflowData);
    } catch (error) {
      console.error('IPC workflow:create error:', error);
      throw new Error(`Failed to create workflow: ${error.message}`);
    }
  });
  
  ipcMain.handle('workflow:getAll', async () => {
    try {
      return workflowExecutor.getAllWorkflows();
    } catch (error) {
      console.error('IPC workflow:getAll error:', error);
      throw new Error(`Failed to get workflows: ${error.message}`);
    }
  });
  
  ipcMain.handle('workflow:get', async (event, id) => {
    try {
      const workflow = workflowExecutor.getWorkflow(id);
      if (!workflow) {
        throw new Error('Workflow not found');
      }
      return workflow;
    } catch (error) {
      console.error('IPC workflow:get error:', error);
      throw new Error(`Failed to get workflow: ${error.message}`);
    }
  });
  
  ipcMain.handle('workflow:update', async (event, id, workflowData) => {
    try {
      return await workflowExecutor.updateWorkflow(id, workflowData);
    } catch (error) {
      console.error('IPC workflow:update error:', error);
      throw new Error(`Failed to update workflow: ${error.message}`);
    }
  });
  
  ipcMain.handle('workflow:delete', async (event, id) => {
    try {
      return await workflowExecutor.deleteWorkflow(id);
    } catch (error) {
      console.error('IPC workflow:delete error:', error);
      throw new Error(`Failed to delete workflow: ${error.message}`);
    }
  });
  
  ipcMain.handle('workflow:execute', async (event, id) => {
    try {
      return await workflowExecutor.executeWorkflow(id, profileManager, (logData) => {
        mainWindow.webContents.send('workflow:log', logData);
      });
    } catch (error) {
      console.error('IPC workflow:execute error:', error);
      throw new Error(`Failed to execute workflow: ${error.message}`);
    }
  });
  
  ipcMain.handle('workflow:stop', async (event, id) => {
    try {
      return await workflowExecutor.stopWorkflow(id);
    } catch (error) {
      console.error('IPC workflow:stop error:', error);
      throw new Error(`Failed to stop workflow: ${error.message}`);
    }
  });
  
  // Settings
  ipcMain.handle('settings:get', async () => {
    try {
      // This would typically load from a settings store
      return {
        theme: 'light',
        autoLaunchOnStartup: false,
        clearCookiesOnClose: false,
        defaultBrowserEngine: 'chromium',
        notificationsEnabled: true,
        blockedDomains: '',
        anonymizationLevel: 'balanced'
      };
    } catch (error) {
      console.error('IPC settings:get error:', error);
      throw new Error(`Failed to get settings: ${error.message}`);
    }
  });
  
  ipcMain.handle('settings:update', async (event, settings) => {
    try {
      // This would typically save to a settings store
      console.log('Updating settings:', settings);
      return true;
    } catch (error) {
      console.error('IPC settings:update error:', error);
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  });
}

module.exports = {
  setupIpcHandlers
};
