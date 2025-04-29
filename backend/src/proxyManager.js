const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const https = require('https');
const { SocksClient } = require('socks');
const { URL } = require('url');

// In-memory storage for proxies
let proxies = [];

/**
 * Initialize proxies from storage
 */
async function initProxies() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const proxiesPath = path.join(dataDir, 'proxies.json');
    
    try {
      const data = await fs.readFile(proxiesPath, 'utf8');
      proxies = JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, create it
        await fs.writeFile(proxiesPath, JSON.stringify([], null, 2), 'utf8');
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Failed to initialize proxies:', error);
    // Start with empty proxies if there's an error
    proxies = [];
  }
}

/**
 * Save proxies to storage
 */
async function saveProxies() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const proxiesPath = path.join(dataDir, 'proxies.json');
    await fs.writeFile(proxiesPath, JSON.stringify(proxies, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save proxies:', error);
    throw new Error('Failed to save proxies');
  }
}

/**
 * Add a new proxy
 * @param {Object} proxyData - The proxy data
 * @returns {Object} The added proxy
 */
async function addProxy(proxyData) {
  try {
    const newProxy = {
      id: uuidv4(),
      name: proxyData.name,
      type: proxyData.type || 'http',
      host: proxyData.host,
      port: proxyData.port,
      username: proxyData.username || '',
      password: proxyData.password || '',
      country: proxyData.country || '',
      city: proxyData.city || '',
      status: 'not_tested',
      lastTest: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    proxies.push(newProxy);
    await saveProxies();
    return newProxy;
  } catch (error) {
    console.error('Error adding proxy:', error);
    throw new Error('Failed to add proxy');
  }
}

/**
 * Get all proxies
 * @returns {Array} All proxies
 */
function getAllProxies() {
  return proxies;
}

/**
 * Get a proxy by ID
 * @param {string} id - The proxy ID
 * @returns {Object|null} The proxy or null if not found
 */
function getProxy(id) {
  return proxies.find(proxy => proxy.id === id) || null;
}

/**
 * Update a proxy
 * @param {string} id - The proxy ID
 * @param {Object} proxyData - The updated proxy data
 * @returns {Object} The updated proxy
 */
async function updateProxy(id, proxyData) {
  try {
    const index = proxies.findIndex(proxy => proxy.id === id);
    if (index === -1) {
      throw new Error('Proxy not found');
    }
    
    const updatedProxy = {
      ...proxies[index],
      name: proxyData.name || proxies[index].name,
      type: proxyData.type || proxies[index].type,
      host: proxyData.host || proxies[index].host,
      port: proxyData.port || proxies[index].port,
      username: proxyData.username !== undefined ? proxyData.username : proxies[index].username,
      password: proxyData.password !== undefined ? proxyData.password : proxies[index].password,
      country: proxyData.country !== undefined ? proxyData.country : proxies[index].country,
      city: proxyData.city !== undefined ? proxyData.city : proxies[index].city,
      updatedAt: Date.now()
    };
    
    proxies[index] = updatedProxy;
    await saveProxies();
    return updatedProxy;
  } catch (error) {
    console.error('Error updating proxy:', error);
    throw new Error(`Failed to update proxy: ${error.message}`);
  }
}

/**
 * Delete a proxy
 * @param {string} id - The proxy ID
 * @returns {boolean} True if the proxy was deleted
 */
async function deleteProxy(id) {
  try {
    const index = proxies.findIndex(proxy => proxy.id === id);
    if (index === -1) {
      throw new Error('Proxy not found');
    }
    
    proxies.splice(index, 1);
    await saveProxies();
    return true;
  } catch (error) {
    console.error('Error deleting proxy:', error);
    throw new Error(`Failed to delete proxy: ${error.message}`);
  }
}

/**
 * Test a proxy
 * @param {string} id - The proxy ID
 * @param {Function} statusCallback - Callback for proxy status updates
 * @returns {Object} The updated proxy
 */
async function testProxy(id, statusCallback) {
  try {
    const index = proxies.findIndex(proxy => proxy.id === id);
    if (index === -1) {
      throw new Error('Proxy not found');
    }
    
    const proxy = proxies[index];
    
    // Update status to testing
    proxy.status = 'testing';
    proxy.lastTest = Date.now();
    
    // Send status update
    statusCallback(proxy);
    
    try {
      // Test the proxy
      const isWorking = await testProxyConnection(proxy);
      
      // Update status based on test result
      proxy.status = isWorking ? 'working' : 'error';
    } catch (error) {
      console.error('Proxy test error:', error);
      proxy.status = 'error';
    }
    
    // Update the proxy in the list
    proxies[index] = proxy;
    await saveProxies();
    
    // Send final status update
    statusCallback(proxy);
    
    return proxy;
  } catch (error) {
    console.error('Error testing proxy:', error);
    throw new Error(`Failed to test proxy: ${error.message}`);
  }
}

/**
 * Test a proxy connection
 * @param {Object} proxy - The proxy to test
 * @returns {Promise<boolean>} True if the proxy is working
 */
async function testProxyConnection(proxy) {
  // Test URL - checks if we can connect to a known website
  const testUrl = 'https://www.google.com';
  const timeoutMs = 10000; // 10 seconds timeout
  
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve(false);
    }, timeoutMs);
    
    try {
      if (proxy.type.startsWith('socks')) {
        // Test SOCKS proxy
        testSocksProxy(proxy, testUrl, timeoutId, resolve);
      } else {
        // Test HTTP/HTTPS proxy
        testHttpProxy(proxy, testUrl, timeoutId, resolve);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Proxy connection test error:', error);
      resolve(false);
    }
  });
}

/**
 * Test an HTTP/HTTPS proxy
 * @param {Object} proxy - The proxy to test
 * @param {string} testUrl - URL to test with
 * @param {number} timeoutId - The timeout ID for the test
 * @param {Function} resolve - Promise resolve function
 */
function testHttpProxy(proxy, testUrl, timeoutId, resolve) {
  const parsedUrl = new URL(testUrl);
  const options = {
    hostname: proxy.host,
    port: proxy.port,
    path: testUrl,
    method: 'GET',
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }
  };
  
  // Add authentication if provided
  if (proxy.username && proxy.password) {
    const auth = `${proxy.username}:${proxy.password}`;
    options.headers['Proxy-Authorization'] = `Basic ${Buffer.from(auth).toString('base64')}`;
  }
  
  const protocol = proxy.type === 'https' ? https : http;
  
  const req = protocol.request(options, (res) => {
    clearTimeout(timeoutId);
    resolve(res.statusCode >= 200 && res.statusCode < 400);
    
    // Consume response data to free up memory
    res.resume();
  });
  
  req.on('error', () => {
    clearTimeout(timeoutId);
    resolve(false);
  });
  
  req.end();
}

/**
 * Test a SOCKS proxy
 * @param {Object} proxy - The proxy to test
 * @param {string} testUrl - URL to test with
 * @param {number} timeoutId - The timeout ID for the test
 * @param {Function} resolve - Promise resolve function
 */
function testSocksProxy(proxy, testUrl, timeoutId, resolve) {
  const parsedUrl = new URL(testUrl);
  
  const socksOptions = {
    proxy: {
      host: proxy.host,
      port: parseInt(proxy.port, 10),
      type: proxy.type === 'socks4' ? 4 : 5
    },
    command: 'connect',
    destination: {
      host: parsedUrl.hostname,
      port: parsedUrl.protocol === 'https:' ? 443 : 80
    },
    timeout: 5000
  };
  
  // Add authentication if provided
  if (proxy.username && proxy.password) {
    socksOptions.proxy.userId = proxy.username;
    socksOptions.proxy.password = proxy.password;
  }
  
  SocksClient.createConnection(socksOptions)
    .then(() => {
      clearTimeout(timeoutId);
      resolve(true);
    })
    .catch(() => {
      clearTimeout(timeoutId);
      resolve(false);
    });
}

/**
 * Format proxy for use with browser automation
 * @param {Object} proxy - The proxy object
 * @returns {Object} Formatted proxy configuration for automation
 */
function formatProxyForAutomation(proxy) {
  if (!proxy) return null;
  
  let formattedProxy = {
    server: `${proxy.host}:${proxy.port}`,
    type: proxy.type
  };
  
  // Add authentication if provided
  if (proxy.username && proxy.password) {
    formattedProxy.username = proxy.username;
    formattedProxy.password = proxy.password;
  }
  
  return formattedProxy;
}

module.exports = {
  initProxies,
  addProxy,
  getAllProxies,
  getProxy,
  updateProxy,
  deleteProxy,
  testProxy,
  formatProxyForAutomation
};
