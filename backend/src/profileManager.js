const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { launchBrowser } = require('./automation/playwright');

// In-memory storage for profiles
let profiles = [];
const activeProfiles = new Map();

/**
 * Initialize profiles from storage
 */
async function initProfiles() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const profilesPath = path.join(dataDir, 'profiles.json');
    
    try {
      const data = await fs.readFile(profilesPath, 'utf8');
      profiles = JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, create it
        await fs.writeFile(profilesPath, JSON.stringify([], null, 2), 'utf8');
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Failed to initialize profiles:', error);
    // Start with empty profiles if there's an error
    profiles = [];
  }
}

/**
 * Save profiles to storage
 */
async function saveProfiles() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const profilesPath = path.join(dataDir, 'profiles.json');
    await fs.writeFile(profilesPath, JSON.stringify(profiles, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save profiles:', error);
    throw new Error('Failed to save profiles');
  }
}

/**
 * Create a new browser profile
 * @param {Object} profileData - The profile data
 * @returns {Object} The created profile
 */
async function createProfile(profileData) {
  try {
    const newProfile = {
      id: uuidv4(),
      name: profileData.name,
      userAgent: profileData.userAgent || '',
      proxyId: profileData.proxyId || null,
      platform: profileData.platform || 'windows',
      screenResolution: profileData.screenResolution || '1920x1080',
      language: profileData.language || 'en-US',
      timezone: profileData.timezone || 'UTC',
      webRTC: profileData.webRTC || 'real',
      canvas: profileData.canvas || 'real',
      webGL: profileData.webGL || 'real',
      notes: profileData.notes || '',
      active: false,
      sessions: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    profiles.push(newProfile);
    await saveProfiles();
    return newProfile;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw new Error('Failed to create profile');
  }
}

/**
 * Get all profiles
 * @returns {Array} All profiles
 */
function getAllProfiles() {
  return profiles;
}

/**
 * Get a profile by ID
 * @param {string} id - The profile ID
 * @returns {Object|null} The profile or null if not found
 */
function getProfile(id) {
  return profiles.find(profile => profile.id === id) || null;
}

/**
 * Update a profile
 * @param {string} id - The profile ID
 * @param {Object} profileData - The updated profile data
 * @returns {Object} The updated profile
 */
async function updateProfile(id, profileData) {
  try {
    const index = profiles.findIndex(profile => profile.id === id);
    if (index === -1) {
      throw new Error('Profile not found');
    }
    
    // Don't allow updating an active profile
    if (profiles[index].active) {
      throw new Error('Cannot update an active profile');
    }
    
    const updatedProfile = {
      ...profiles[index],
      name: profileData.name || profiles[index].name,
      userAgent: profileData.userAgent !== undefined ? profileData.userAgent : profiles[index].userAgent,
      proxyId: profileData.proxyId !== undefined ? profileData.proxyId : profiles[index].proxyId,
      platform: profileData.platform || profiles[index].platform,
      screenResolution: profileData.screenResolution || profiles[index].screenResolution,
      language: profileData.language || profiles[index].language,
      timezone: profileData.timezone || profiles[index].timezone,
      webRTC: profileData.webRTC || profiles[index].webRTC,
      canvas: profileData.canvas || profiles[index].canvas,
      webGL: profileData.webGL || profiles[index].webGL,
      notes: profileData.notes !== undefined ? profileData.notes : profiles[index].notes,
      updatedAt: Date.now()
    };
    
    profiles[index] = updatedProfile;
    await saveProfiles();
    return updatedProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

/**
 * Delete a profile
 * @param {string} id - The profile ID
 * @returns {boolean} True if the profile was deleted
 */
async function deleteProfile(id) {
  try {
    const index = profiles.findIndex(profile => profile.id === id);
    if (index === -1) {
      throw new Error('Profile not found');
    }
    
    // Don't allow deleting an active profile
    if (profiles[index].active) {
      throw new Error('Cannot delete an active profile');
    }
    
    profiles.splice(index, 1);
    await saveProfiles();
    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw new Error(`Failed to delete profile: ${error.message}`);
  }
}

/**
 * Launch a browser profile
 * @param {string} id - The profile ID
 * @param {Function} proxyManager - The proxy manager
 * @param {Function} statusCallback - Callback for profile status updates
 * @returns {Object} The updated profile
 */
async function launchProfile(id, proxyManager, statusCallback) {
  try {
    const profile = getProfile(id);
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    // Don't launch if already active
    if (profile.active) {
      throw new Error('Profile is already active');
    }
    
    // Get proxy if specified
    let proxy = null;
    if (profile.proxyId) {
      proxy = proxyManager.getProxy(profile.proxyId);
      if (!proxy) {
        throw new Error('Proxy not found');
      }
    }
    
    // Update profile status
    const updatedProfile = await updateProfileStatus(id, true);
    
    // Launch the browser in a separate process/thread
    try {
      statusCallback(updatedProfile);
      
      const browserInstance = await launchBrowser(profile, proxy);
      activeProfiles.set(id, browserInstance);
      
      // Update sessions count
      const index = profiles.findIndex(p => p.id === id);
      if (index !== -1) {
        profiles[index].sessions += 1;
        await saveProfiles();
      }
      
      // Listen for browser close
      browserInstance.browser.on('disconnected', async () => {
        await closeProfile(id, statusCallback);
      });
      
      return updatedProfile;
    } catch (error) {
      // If launch fails, update the profile status back to inactive
      await updateProfileStatus(id, false);
      statusCallback({
        ...updatedProfile,
        active: false
      });
      throw error;
    }
  } catch (error) {
    console.error('Error launching profile:', error);
    throw new Error(`Failed to launch profile: ${error.message}`);
  }
}

/**
 * Close a browser profile
 * @param {string} id - The profile ID
 * @param {Function} statusCallback - Callback for profile status updates
 * @returns {Object} The updated profile
 */
async function closeProfile(id, statusCallback) {
  try {
    const browserInstance = activeProfiles.get(id);
    if (browserInstance) {
      try {
        // Close the browser if it's still running
        if (browserInstance.browser && browserInstance.browser.isConnected()) {
          await browserInstance.browser.close();
        }
      } catch (error) {
        console.error('Error closing browser:', error);
      }
      
      activeProfiles.delete(id);
    }
    
    // Update profile status
    const updatedProfile = await updateProfileStatus(id, false);
    statusCallback(updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Error closing profile:', error);
    throw new Error(`Failed to close profile: ${error.message}`);
  }
}

/**
 * Update a profile's active status
 * @param {string} id - The profile ID
 * @param {boolean} active - The new active status
 * @returns {Object} The updated profile
 */
async function updateProfileStatus(id, active) {
  try {
    const index = profiles.findIndex(profile => profile.id === id);
    if (index === -1) {
      throw new Error('Profile not found');
    }
    
    profiles[index].active = active;
    profiles[index].updatedAt = Date.now();
    
    await saveProfiles();
    return profiles[index];
  } catch (error) {
    console.error('Error updating profile status:', error);
    throw new Error(`Failed to update profile status: ${error.message}`);
  }
}

/**
 * Get browser instance for a profile (used by automation)
 * @param {string} id - The profile ID
 * @returns {Object|null} The browser instance or null if not active
 */
function getProfileBrowserInstance(id) {
  return activeProfiles.get(id) || null;
}

/**
 * Close all active profiles
 */
async function closeAllProfiles() {
  const activeProfileIds = [...activeProfiles.keys()];
  
  for (const id of activeProfileIds) {
    try {
      await closeProfile(id, () => {});
    } catch (error) {
      console.error(`Error closing profile ${id}:`, error);
    }
  }
}

module.exports = {
  initProfiles,
  createProfile,
  getAllProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
  launchProfile,
  closeProfile,
  getProfileBrowserInstance,
  closeAllProfiles
};
