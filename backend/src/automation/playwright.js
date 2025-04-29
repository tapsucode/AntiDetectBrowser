const { chromium, firefox, webkit } = require('playwright');
const { BROWSER_ENGINES } = require('../../shared/constants');

/**
 * Launch a browser with specified profile and proxy settings
 * @param {Object} profile - The browser profile configuration
 * @param {Object} proxy - Optional proxy configuration
 * @returns {Object} Browser and context instances
 */
async function launchBrowser(profile, proxy = null) {
  try {
    // Determine browser type based on profile settings or default
    const browserType = getBrowserType(profile);
    
    // Prepare browser launch options
    const launchOptions = {
      headless: false,
      args: [
        '--disable-extensions',
        '--disable-infobars',
        `--window-size=${profile.screenResolution.replace('x', ',')}`
      ]
    };
    
    // Configure proxy if provided
    if (proxy) {
      const formattedProxy = formatProxy(proxy);
      if (formattedProxy) {
        launchOptions.proxy = formattedProxy;
      }
    }
    
    // Launch the browser
    console.log(`Launching ${browserType.name()} browser for profile: ${profile.name}`);
    const browser = await browserType.launch(launchOptions);
    
    // Configure browser context based on profile settings
    const contextOptions = {
      userAgent: profile.userAgent || undefined,
      locale: profile.language,
      timezoneId: profile.timezone,
      viewport: parseResolution(profile.screenResolution),
      deviceScaleFactor: 1,
      hasTouch: false,
      ignoreHTTPSErrors: true,
      javaScriptEnabled: true
    };
    
    // Apply fingerprinting protections
    applyFingerprintProtection(contextOptions, profile);
    
    // Create a browser context with the specified options
    const context = await browser.newContext(contextOptions);
    
    // Create a default page
    const page = await context.newPage();
    await page.goto('about:blank');
    
    return { browser, context, page };
  } catch (error) {
    console.error('Failed to launch browser:', error);
    throw new Error(`Failed to launch browser: ${error.message}`);
  }
}

/**
 * Get the appropriate browser type based on profile settings
 * @param {Object} profile - The browser profile
 * @returns {Object} Playwright browser type
 */
function getBrowserType(profile) {
  // Use the engine from profile settings or default to chromium
  const engineName = profile.browserEngine || BROWSER_ENGINES.CHROMIUM;
  
  switch (engineName) {
    case BROWSER_ENGINES.FIREFOX:
      return firefox;
    case BROWSER_ENGINES.WEBKIT:
      return webkit;
    case BROWSER_ENGINES.CHROMIUM:
    default:
      return chromium;
  }
}

/**
 * Format proxy configuration for Playwright
 * @param {Object} proxy - The proxy configuration
 * @returns {Object} Formatted proxy object for Playwright
 */
function formatProxy(proxy) {
  if (!proxy || !proxy.host || !proxy.port) {
    return null;
  }
  
  const result = {
    server: `${proxy.type === 'https' ? 'https' : 'http'}://${proxy.host}:${proxy.port}`
  };
  
  if (proxy.username && proxy.password) {
    result.username = proxy.username;
    result.password = proxy.password;
  }
  
  return result;
}

/**
 * Parse screen resolution string to viewport object
 * @param {string} resolution - Resolution string (e.g., "1920x1080")
 * @returns {Object} Viewport width and height
 */
function parseResolution(resolution) {
  const [width, height] = resolution.split('x').map(Number);
  return { width, height };
}

/**
 * Apply fingerprint protection settings to browser context
 * @param {Object} contextOptions - Browser context options
 * @param {Object} profile - The browser profile
 */
function applyFingerprintProtection(contextOptions, profile) {
  // WebRTC protection
  if (profile.webRTC === 'fake' || profile.webRTC === 'disabled') {
    contextOptions.permissions = ['geolocation', 'notifications', 'camera', 'microphone'];
  }
  
  // Canvas and WebGL protections are applied via the browser context
  // but some need JavaScript injection for full protection
  
  // Additional options could be added here based on the specific fingerprinting methods
}

/**
 * Run a workflow using Playwright
 * @param {Object} workflow - The workflow to execute
 * @param {Object} profile - The profile to use
 * @param {Function} logCallback - Callback for logging
 * @param {Object} stopToken - Token for stopping the workflow
 */
async function runPlaywrightWorkflow(workflow, profile, logCallback, stopToken) {
  let browser = null;
  let context = null;
  let page = null;
  
  try {
    // Check if we should stop
    if (stopToken.cancelled) {
      logCallback('info', 'Workflow execution cancelled before starting');
      return;
    }
    
    logCallback('info', 'Setting up browser environment');
    
    // Launch the browser using profile configuration
    const browserInstance = await launchBrowser(profile);
    browser = browserInstance.browser;
    context = browserInstance.context;
    page = browserInstance.page;
    
    logCallback('info', 'Browser launched successfully');
    
    // Execute each step in the workflow
    for (let i = 0; i < workflow.steps.length; i++) {
      // Check if we should stop
      if (stopToken.cancelled) {
        logCallback('info', 'Workflow execution cancelled');
        break;
      }
      
      const step = workflow.steps[i];
      logCallback('info', `Executing step ${i + 1}: ${step.type}`);
      
      await executeWorkflowStep(page, step, logCallback);
      
      logCallback('success', `Step ${i + 1} completed`);
    }
    
    logCallback('success', 'Workflow execution completed');
    
  } catch (error) {
    logCallback('error', `Workflow error: ${error.message}`);
    console.error('Workflow execution error:', error);
    throw error;
  } finally {
    // Close browser if it's still open and we're not keeping it open for the profile
    if (browser && !stopToken.keepBrowserOpen) {
      try {
        await browser.close();
        logCallback('info', 'Browser closed');
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
}

/**
 * Execute a single workflow step
 * @param {Object} page - Playwright page object
 * @param {Object} step - The workflow step to execute
 * @param {Function} logCallback - Callback for logging
 */
async function executeWorkflowStep(page, step, logCallback) {
  try {
    switch (step.type) {
      case 'navigate':
        await page.goto(step.parameters.url, {
          waitUntil: step.parameters.waitUntil || 'load',
          timeout: step.parameters.timeout || 30000
        });
        logCallback('info', `Navigated to: ${step.parameters.url}`);
        break;
        
      case 'click':
        await page.click(step.parameters.selector, {
          button: step.parameters.button || 'left',
          clickCount: step.parameters.clickCount || 1,
          delay: step.parameters.delay || 0,
          timeout: step.parameters.timeout || 30000
        });
        logCallback('info', `Clicked element: ${step.parameters.selector}`);
        break;
        
      case 'type':
        await page.fill(step.parameters.selector, step.parameters.text, {
          timeout: step.parameters.timeout || 30000
        });
        logCallback('info', `Typed text into: ${step.parameters.selector}`);
        break;
        
      case 'wait':
        if (step.parameters.milliseconds) {
          await page.waitForTimeout(step.parameters.milliseconds);
          logCallback('info', `Waited for ${step.parameters.milliseconds}ms`);
        } else if (step.parameters.selector) {
          await page.waitForSelector(step.parameters.selector, {
            state: step.parameters.state || 'visible',
            timeout: step.parameters.timeout || 30000
          });
          logCallback('info', `Waited for selector: ${step.parameters.selector}`);
        } else if (step.parameters.navigation) {
          await page.waitForNavigation({
            waitUntil: step.parameters.waitUntil || 'load',
            timeout: step.parameters.timeout || 30000
          });
          logCallback('info', 'Waited for navigation to complete');
        }
        break;
        
      case 'screenshot':
        const screenshotPath = path.join(process.cwd(), 'data', 'screenshots', step.parameters.filename || `screenshot-${Date.now()}.png`);
        
        // Ensure directory exists
        await fs.mkdir(path.join(process.cwd(), 'data', 'screenshots'), { recursive: true });
        
        await page.screenshot({
          path: screenshotPath,
          fullPage: step.parameters.fullPage || false
        });
        logCallback('info', `Screenshot saved to: ${screenshotPath}`);
        break;
        
      case 'extract':
        const extractedData = await page.evaluate((selector) => {
          const elements = Array.from(document.querySelectorAll(selector));
          return elements.map(el => el.textContent.trim());
        }, step.parameters.selector);
        
        logCallback('info', `Extracted ${extractedData.length} items from ${step.parameters.selector}`);
        logCallback('info', `Data: ${JSON.stringify(extractedData.slice(0, 5))}${extractedData.length > 5 ? '...' : ''}`);
        break;
        
      default:
        logCallback('warning', `Unknown step type: ${step.type}`);
    }
  } catch (error) {
    logCallback('error', `Step execution error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  launchBrowser,
  runPlaywrightWorkflow
};
