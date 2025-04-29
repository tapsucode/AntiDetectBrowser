const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Profile Management
  createProfile: (profileData) => ipcRenderer.invoke('profile:create', profileData),
  getProfiles: () => ipcRenderer.invoke('profile:getAll'),
  getProfile: (id) => ipcRenderer.invoke('profile:get', id),
  updateProfile: (id, profileData) => ipcRenderer.invoke('profile:update', id, profileData),
  deleteProfile: (id) => ipcRenderer.invoke('profile:delete', id),
  launchProfile: (id) => ipcRenderer.invoke('profile:launch', id),
  
  // Proxy Management
  addProxy: (proxyData) => ipcRenderer.invoke('proxy:add', proxyData),
  getProxies: () => ipcRenderer.invoke('proxy:getAll'),
  getProxy: (id) => ipcRenderer.invoke('proxy:get', id),
  updateProxy: (id, proxyData) => ipcRenderer.invoke('proxy:update', id, proxyData),
  deleteProxy: (id) => ipcRenderer.invoke('proxy:delete', id),
  testProxy: (id) => ipcRenderer.invoke('proxy:test', id),
  
  // Automation
  createWorkflow: (workflowData) => ipcRenderer.invoke('workflow:create', workflowData),
  getWorkflows: () => ipcRenderer.invoke('workflow:getAll'),
  getWorkflow: (id) => ipcRenderer.invoke('workflow:get', id),
  updateWorkflow: (id, workflowData) => ipcRenderer.invoke('workflow:update', id, workflowData),
  deleteWorkflow: (id) => ipcRenderer.invoke('workflow:delete', id),
  executeWorkflow: (id) => ipcRenderer.invoke('workflow:execute', id),
  stopWorkflow: (id) => ipcRenderer.invoke('workflow:stop', id),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),
  
  // Events
  on: (channel, callback) => {
    // Whitelist channels for security
    const validChannels = [
      'profile:status',
      'proxy:status',
      'workflow:status',
      'workflow:log',
      'theme:changed'
    ];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (_, ...args) => callback(...args));
    }
  },
  removeListener: (channel) => {
    const validChannels = [
      'profile:status',
      'proxy:status',
      'workflow:status',
      'workflow:log',
      'theme:changed'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});
