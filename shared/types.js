/**
 * TypeScript type definitions for the application
 */

/**
 * @typedef {Object} Profile
 * @property {string} id - Unique identifier for the profile
 * @property {string} name - Name of the profile
 * @property {string} [userAgent] - Custom user agent string
 * @property {string} [proxyId] - ID of the proxy to use
 * @property {string} platform - Operating system platform
 * @property {string} screenResolution - Screen resolution (e.g., "1920x1080")
 * @property {string} language - Browser language
 * @property {string} timezone - Timezone
 * @property {string} webRTC - WebRTC fingerprinting protection
 * @property {string} canvas - Canvas fingerprinting protection
 * @property {string} webGL - WebGL fingerprinting protection
 * @property {string} [notes] - Optional notes about the profile
 * @property {boolean} active - Whether the profile is currently active
 * @property {number} sessions - Number of sessions launched with this profile
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Proxy
 * @property {string} id - Unique identifier for the proxy
 * @property {string} name - Name of the proxy
 * @property {string} type - Proxy type (http, https, socks4, socks5, ssl)
 * @property {string} host - Host/IP address
 * @property {string} port - Port number
 * @property {string} [username] - Optional username for authentication
 * @property {string} [password] - Optional password for authentication
 * @property {string} [country] - Optional country of the proxy
 * @property {string} [city] - Optional city of the proxy
 * @property {string} status - Proxy status (working, error, not_tested, testing)
 * @property {number} [lastTest] - Timestamp of the last test
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} WorkflowStep
 * @property {string} type - Step type (navigate, click, type, wait, etc.)
 * @property {Object} parameters - Step-specific parameters
 */

/**
 * @typedef {Object} Workflow
 * @property {string} id - Unique identifier for the workflow
 * @property {string} name - Name of the workflow
 * @property {string} [description] - Optional description
 * @property {string} profileId - ID of the profile to use
 * @property {Array<WorkflowStep>} steps - Array of workflow steps
 * @property {string} status - Workflow status (idle, running, completed, error)
 * @property {number} [lastRun] - Timestamp of the last run
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} LogEntry
 * @property {string} workflowId - ID of the workflow this log belongs to
 * @property {string} level - Log level (info, success, warning, error)
 * @property {string} message - Log message
 * @property {number} timestamp - Log timestamp
 */

/**
 * @typedef {Object} Settings
 * @property {string} theme - UI theme (light, dark, system)
 * @property {boolean} autoLaunchOnStartup - Launch on system startup
 * @property {boolean} clearCookiesOnClose - Clear cookies when closing profiles
 * @property {string} defaultBrowserEngine - Default browser engine
 * @property {boolean} notificationsEnabled - Enable desktop notifications
 * @property {string} blockedDomains - Comma-separated list of domains to block
 * @property {string} anonymizationLevel - Level of fingerprinting protection
 */

/**
 * Since this is a JavaScript file and not TypeScript, we're using JSDoc for type definitions.
 * In a TypeScript project, you would export interfaces instead.
 */

module.exports = {}; // This empty export is just to make the file a proper module
