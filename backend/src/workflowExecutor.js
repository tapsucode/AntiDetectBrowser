const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { runPlaywrightWorkflow } = require('./automation/playwright');

// In-memory storage for workflows
let workflows = [];
const runningWorkflows = new Map();

/**
 * Initialize workflows from storage
 */
async function initWorkflows() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const workflowsPath = path.join(dataDir, 'workflows.json');
    
    try {
      const data = await fs.readFile(workflowsPath, 'utf8');
      workflows = JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, create it
        await fs.writeFile(workflowsPath, JSON.stringify([], null, 2), 'utf8');
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Failed to initialize workflows:', error);
    // Start with empty workflows if there's an error
    workflows = [];
  }
}

/**
 * Save workflows to storage
 */
async function saveWorkflows() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const workflowsPath = path.join(dataDir, 'workflows.json');
    await fs.writeFile(workflowsPath, JSON.stringify(workflows, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save workflows:', error);
    throw new Error('Failed to save workflows');
  }
}

/**
 * Create a new workflow
 * @param {Object} workflowData - The workflow data
 * @returns {Object} The created workflow
 */
async function createWorkflow(workflowData) {
  try {
    const newWorkflow = {
      id: uuidv4(),
      name: workflowData.name,
      description: workflowData.description || '',
      profileId: workflowData.profileId,
      steps: workflowData.steps || [],
      status: 'idle',
      lastRun: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    workflows.push(newWorkflow);
    await saveWorkflows();
    return newWorkflow;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw new Error('Failed to create workflow');
  }
}

/**
 * Get all workflows
 * @returns {Array} All workflows
 */
function getAllWorkflows() {
  return workflows;
}

/**
 * Get a workflow by ID
 * @param {string} id - The workflow ID
 * @returns {Object|null} The workflow or null if not found
 */
function getWorkflow(id) {
  return workflows.find(workflow => workflow.id === id) || null;
}

/**
 * Update a workflow
 * @param {string} id - The workflow ID
 * @param {Object} workflowData - The updated workflow data
 * @returns {Object} The updated workflow
 */
async function updateWorkflow(id, workflowData) {
  try {
    const index = workflows.findIndex(workflow => workflow.id === id);
    if (index === -1) {
      throw new Error('Workflow not found');
    }
    
    // Don't allow updating a running workflow
    if (workflows[index].status === 'running') {
      throw new Error('Cannot update a running workflow');
    }
    
    const updatedWorkflow = {
      ...workflows[index],
      name: workflowData.name || workflows[index].name,
      description: workflowData.description !== undefined ? workflowData.description : workflows[index].description,
      profileId: workflowData.profileId || workflows[index].profileId,
      steps: workflowData.steps || workflows[index].steps,
      updatedAt: Date.now()
    };
    
    workflows[index] = updatedWorkflow;
    await saveWorkflows();
    return updatedWorkflow;
  } catch (error) {
    console.error('Error updating workflow:', error);
    throw new Error(`Failed to update workflow: ${error.message}`);
  }
}

/**
 * Delete a workflow
 * @param {string} id - The workflow ID
 * @returns {boolean} True if the workflow was deleted
 */
async function deleteWorkflow(id) {
  try {
    const index = workflows.findIndex(workflow => workflow.id === id);
    if (index === -1) {
      throw new Error('Workflow not found');
    }
    
    // Don't allow deleting a running workflow
    if (workflows[index].status === 'running') {
      throw new Error('Cannot delete a running workflow');
    }
    
    workflows.splice(index, 1);
    await saveWorkflows();
    return true;
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw new Error(`Failed to delete workflow: ${error.message}`);
  }
}

/**
 * Execute a workflow
 * @param {string} id - The workflow ID
 * @param {Function} profileManager - The profile manager
 * @param {Function} logCallback - Callback for logging
 * @returns {Object} The updated workflow
 */
async function executeWorkflow(id, profileManager, logCallback) {
  try {
    const workflow = getWorkflow(id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    
    // Don't start if already running
    if (workflow.status === 'running') {
      throw new Error('Workflow is already running');
    }
    
    // Verify the profile exists
    const profile = profileManager.getProfile(workflow.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    // Update workflow status
    const updatedWorkflow = await updateWorkflowStatus(id, 'running');
    
    // Start the execution in a separate process/thread
    const stopToken = { cancelled: false };
    runningWorkflows.set(id, stopToken);
    
    // Execute asynchronously
    executeWorkflowAsync(id, profile, stopToken, logCallback)
      .catch(error => {
        console.error(`Workflow execution error (${id}):`, error);
        updateWorkflowStatus(id, 'error');
        logCallback({
          workflowId: id,
          level: 'error',
          message: `Execution failed: ${error.message}`,
          timestamp: Date.now()
        });
      })
      .finally(() => {
        runningWorkflows.delete(id);
      });
    
    return updatedWorkflow;
  } catch (error) {
    console.error('Error executing workflow:', error);
    throw new Error(`Failed to execute workflow: ${error.message}`);
  }
}

/**
 * Execute a workflow asynchronously
 * @param {string} id - The workflow ID
 * @param {Object} profile - The profile to use
 * @param {Object} stopToken - Token for stopping the workflow
 * @param {Function} logCallback - Callback for logging
 */
async function executeWorkflowAsync(id, profile, stopToken, logCallback) {
  const workflow = getWorkflow(id);
  
  try {
    logCallback({
      workflowId: id,
      level: 'info',
      message: `Starting workflow execution: ${workflow.name}`,
      timestamp: Date.now()
    });
    
    // Update the last run time
    const index = workflows.findIndex(w => w.id === id);
    if (index !== -1) {
      workflows[index].lastRun = Date.now();
      await saveWorkflows();
    }
    
    // Execute the workflow using Playwright
    await runPlaywrightWorkflow(
      workflow,
      profile,
      (level, message) => {
        logCallback({
          workflowId: id,
          level,
          message,
          timestamp: Date.now()
        });
      },
      stopToken
    );
    
    // Update status on completion if not cancelled
    if (!stopToken.cancelled) {
      await updateWorkflowStatus(id, 'completed');
      logCallback({
        workflowId: id,
        level: 'success',
        message: 'Workflow completed successfully',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    if (!stopToken.cancelled) {
      await updateWorkflowStatus(id, 'error');
      logCallback({
        workflowId: id,
        level: 'error',
        message: `Execution error: ${error.message}`,
        timestamp: Date.now()
      });
    }
    throw error;
  }
}

/**
 * Stop a running workflow
 * @param {string} id - The workflow ID
 * @returns {boolean} True if the workflow was stopped
 */
async function stopWorkflow(id) {
  try {
    const stopToken = runningWorkflows.get(id);
    if (!stopToken) {
      throw new Error('Workflow is not running');
    }
    
    // Signal the workflow to stop
    stopToken.cancelled = true;
    
    // Update the workflow status
    await updateWorkflowStatus(id, 'idle');
    return true;
  } catch (error) {
    console.error('Error stopping workflow:', error);
    throw new Error(`Failed to stop workflow: ${error.message}`);
  }
}

/**
 * Update a workflow's status
 * @param {string} id - The workflow ID
 * @param {string} status - The new status
 * @returns {Object} The updated workflow
 */
async function updateWorkflowStatus(id, status) {
  try {
    const index = workflows.findIndex(workflow => workflow.id === id);
    if (index === -1) {
      throw new Error('Workflow not found');
    }
    
    workflows[index].status = status;
    workflows[index].updatedAt = Date.now();
    
    await saveWorkflows();
    return workflows[index];
  } catch (error) {
    console.error('Error updating workflow status:', error);
    throw new Error(`Failed to update workflow status: ${error.message}`);
  }
}

module.exports = {
  initWorkflows,
  createWorkflow,
  getAllWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  stopWorkflow
};
