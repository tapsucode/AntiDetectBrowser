document.addEventListener('DOMContentLoaded', function() {
  // Global zoom level
  let zoomLevel = 1;
  
  // Global storage for workflow data
  let currentWorkflow = {
    id: '1',
    name: 'Login Automation',
    description: 'Automated login to example website',
    profileId: '1',
    steps: [
      {
        id: '1',
        type: 'navigate',
        parameters: { url: 'https://example.com/login' }
      },
      {
        id: '2',
        type: 'type',
        parameters: { selector: '#username', text: 'testuser' }
      },
      {
        id: '3',
        type: 'type',
        parameters: { selector: '#password', text: 'password123' }
      },
      {
        id: '4',
        type: 'click',
        parameters: { selector: '#loginButton' }
      },
      {
        id: '5',
        type: 'wait',
        parameters: { selector: '.dashboard-container' }
      }
    ],
    status: 'idle',
    lastRun: Date.now() - 7 * 24 * 60 * 60 * 1000
  };
  
  let editingStepIndex = -1;
  let deletingStepIndex = -1;
  
  // Step type icons and parameter templates
  const stepTypeConfigs = {
    navigate: {
      icon: 'fas fa-globe',
      title: 'Điều hướng',
      formTemplate: `
        <div class="step-form-fields">
          <div class="step-form-field">
            <label for="url">URL:</label>
            <input type="text" id="url" name="url" placeholder="https://example.com" required>
          </div>
        </div>
      `,
      generateParams: () => ({
        url: document.getElementById('url').value
      }),
      validateParams: (params) => !!params.url && params.url.trim().length > 0
    },
    click: {
      icon: 'fas fa-mouse-pointer',
      title: 'Click',
      formTemplate: `
        <div class="step-form-fields">
          <div class="step-form-field">
            <label for="selector">Selector:</label>
            <input type="text" id="selector" name="selector" placeholder="#button, .class, etc." required>
          </div>
        </div>
      `,
      generateParams: () => ({
        selector: document.getElementById('selector').value
      }),
      validateParams: (params) => !!params.selector && params.selector.trim().length > 0
    },
    type: {
      icon: 'fas fa-keyboard',
      title: 'Nhập văn bản',
      formTemplate: `
        <div class="step-form-fields">
          <div class="step-form-field">
            <label for="selector">Selector:</label>
            <input type="text" id="selector" name="selector" placeholder="#input, .input-class, etc." required>
          </div>
          <div class="step-form-field">
            <label for="text">Text:</label>
            <input type="text" id="text" name="text" placeholder="Text to type" required>
          </div>
        </div>
      `,
      generateParams: () => ({
        selector: document.getElementById('selector').value,
        text: document.getElementById('text').value
      }),
      validateParams: (params) => 
        !!params.selector && params.selector.trim().length > 0 && 
        !!params.text && params.text.trim().length > 0
    },
    wait: {
      icon: 'fas fa-clock',
      title: 'Chờ đợi',
      formTemplate: `
        <div class="step-form-fields">
          <div class="step-form-field">
            <label for="selector">Selector (tùy chọn):</label>
            <input type="text" id="selector" name="selector" placeholder="#element, .class, etc.">
          </div>
          <div class="step-form-field">
            <label for="seconds">Thời gian (giây):</label>
            <input type="number" id="seconds" name="seconds" min="1" max="60" value="5">
          </div>
        </div>
      `,
      generateParams: () => {
        const params = {};
        const selector = document.getElementById('selector').value;
        const seconds = document.getElementById('seconds').value;
        
        if (selector && selector.trim().length > 0) {
          params.selector = selector;
        }
        
        if (seconds && !isNaN(seconds)) {
          params.seconds = parseInt(seconds);
        } else {
          params.seconds = 5;
        }
        
        return params;
      },
      validateParams: (params) => 
        (params.selector === undefined || params.selector.trim().length > 0) && 
        params.seconds > 0
    },
    screenshot: {
      icon: 'fas fa-camera',
      title: 'Chụp màn hình',
      formTemplate: `
        <div class="step-form-fields">
          <div class="step-form-field">
            <label for="filename">Tên file:</label>
            <input type="text" id="filename" name="filename" placeholder="screenshot_name" required>
          </div>
          <div class="step-form-field">
            <label for="selector">Selector cụ thể (tùy chọn):</label>
            <input type="text" id="selector" name="selector" placeholder="#element, .class, etc.">
          </div>
        </div>
      `,
      generateParams: () => {
        const params = {
          filename: document.getElementById('filename').value
        };
        
        const selector = document.getElementById('selector').value;
        if (selector && selector.trim().length > 0) {
          params.selector = selector;
        }
        
        return params;
      },
      validateParams: (params) => !!params.filename && params.filename.trim().length > 0
    },
    extract: {
      icon: 'fas fa-copy',
      title: 'Trích xuất dữ liệu',
      formTemplate: `
        <div class="step-form-fields">
          <div class="step-form-field">
            <label for="selector">Selector:</label>
            <input type="text" id="selector" name="selector" placeholder="#element, .class, etc." required>
          </div>
          <div class="step-form-field">
            <label for="attribute">Attribute (tùy chọn):</label>
            <input type="text" id="attribute" name="attribute" placeholder="href, src, v.v.">
          </div>
          <div class="step-form-field">
            <label for="variableName">Tên biến:</label>
            <input type="text" id="variableName" name="variableName" placeholder="data" required>
          </div>
        </div>
      `,
      generateParams: () => {
        const params = {
          selector: document.getElementById('selector').value,
          variableName: document.getElementById('variableName').value
        };
        
        const attribute = document.getElementById('attribute').value;
        if (attribute && attribute.trim().length > 0) {
          params.attribute = attribute;
        }
        
        return params;
      },
      validateParams: (params) => 
        !!params.selector && params.selector.trim().length > 0 &&
        !!params.variableName && params.variableName.trim().length > 0
    }
  };
  
  // DOM Elements
  const workflowNameInput = document.getElementById('workflow-name');
  const workflowProfileSelect = document.getElementById('workflow-profile');
  const saveWorkflowBtn = document.getElementById('save-workflow');
  const testWorkflowBtn = document.getElementById('test-workflow');
  const newWorkflowBtn = document.getElementById('new-workflow-btn');
  const dropArea = document.querySelector('.drop-area');
  const stepModal = document.getElementById('step-modal');
  const stepModalTitle = document.getElementById('step-modal-title');
  const stepModalBody = document.getElementById('step-modal-body');
  const saveStepBtn = document.getElementById('save-step');
  const cancelStepBtn = document.getElementById('cancel-step');
  const confirmModal = document.getElementById('confirm-modal');
  const confirmMessage = document.getElementById('confirm-message');
  const confirmActionBtn = document.getElementById('confirm-action');
  const cancelConfirmBtn = document.getElementById('cancel-confirm');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  
  // Initialize
  initDragAndDrop();
  renderWorkflowSteps();
  
  // Initialize the name input
  workflowNameInput.value = currentWorkflow.name;
  
  // Initialize the profile select
  workflowProfileSelect.value = currentWorkflow.profileId;
  
  // Zoom controls
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomLevelDisplay = document.getElementById('zoom-level');
  
  // Selected workflow dropdown
  const selectedWorkflow = document.querySelector('.selected-workflow');
  const workflowDropdown = document.querySelector('.workflow-dropdown');
  const workflowDropdownItems = document.querySelectorAll('.workflow-dropdown-item');
  
  // Zoom event listeners
  zoomInBtn?.addEventListener('click', function() {
    if (zoomLevel < 2) {  // Max zoom: 200%
      zoomLevel += 0.1;
      updateZoom();
    }
  });
  
  zoomOutBtn?.addEventListener('click', function() {
    if (zoomLevel > 0.5) {  // Min zoom: 50%
      zoomLevel -= 0.1;
      updateZoom();
    }
  });
  
  // Function to update zoom
  function updateZoom() {
    zoomLevel = Math.round(zoomLevel * 10) / 10; // Round to 1 decimal place
    zoomLevelDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;
    dropArea.style.transform = `scale(${zoomLevel})`;
  }
  
  // Workflow dropdown toggle
  selectedWorkflow?.addEventListener('click', function() {
    workflowDropdown.classList.toggle('hidden');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!selectedWorkflow?.contains(e.target) && !workflowDropdown?.contains(e.target)) {
      workflowDropdown?.classList.add('hidden');
    }
  });
  
  // Workflow selection
  workflowDropdownItems.forEach(item => {
    item.addEventListener('click', function() {
      if (this.classList.contains('add-new')) {
        createNewWorkflow();
        return;
      }
      
      // Update selected workflow
      const workflowName = this.querySelector('.dropdown-workflow-name').textContent;
      selectedWorkflow.querySelector('span').textContent = workflowName;
      
      // Hide dropdown
      workflowDropdown.classList.add('hidden');
      
      // This would normally load the selected workflow
      // For demo, just show info message
      if (!this.classList.contains('active')) {
        showToast('Info', 'This is a demo - workflow switching is limited', 'info');
      }
      
      // Update active class
      workflowDropdownItems.forEach(wi => wi.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Event listeners
  workflowNameInput.addEventListener('change', function() {
    currentWorkflow.name = this.value;
    // Update selected workflow display
    if (selectedWorkflow) {
      selectedWorkflow.querySelector('span').textContent = this.value;
    }
  });
  
  workflowProfileSelect.addEventListener('change', function() {
    currentWorkflow.profileId = this.value;
    
    // If "Add new profile" is selected, show profile modal
    if (this.value === 'add-new') {
      // This would normally show the profile creation modal
      // For now, just reset to first profile
      this.value = '1';
      currentWorkflow.profileId = '1';
      showToast('Info', 'Feature not implemented: Adding new profile from automation page. Please use the Profiles page.', 'info');
    }
  });
  
  saveWorkflowBtn.addEventListener('click', saveWorkflow);
  testWorkflowBtn.addEventListener('click', testWorkflow);
  newWorkflowBtn.addEventListener('click', createNewWorkflow);
  
  saveStepBtn.addEventListener('click', saveStep);
  cancelStepBtn.addEventListener('click', closeStepModal);
  
  confirmActionBtn.addEventListener('click', confirmAction);
  cancelConfirmBtn.addEventListener('click', closeConfirmModal);
  
  closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal-container');
      modal.classList.add('hidden');
    });
  });
  
  // Add click event listeners to existing steps
  document.querySelectorAll('.edit-step').forEach(button => {
    button.addEventListener('click', function() {
      const stepElement = this.closest('.workflow-step');
      const stepId = stepElement.dataset.stepId;
      const stepIndex = currentWorkflow.steps.findIndex(step => step.id === stepId);
      openStepModal(stepIndex);
    });
  });
  
  document.querySelectorAll('.duplicate-step').forEach(button => {
    button.addEventListener('click', function() {
      const stepElement = this.closest('.workflow-step');
      const stepId = stepElement.dataset.stepId;
      const stepIndex = currentWorkflow.steps.findIndex(step => step.id === stepId);
      duplicateStep(stepIndex);
    });
  });
  
  document.querySelectorAll('.delete-step').forEach(button => {
    button.addEventListener('click', function() {
      const stepElement = this.closest('.workflow-step');
      const stepId = stepElement.dataset.stepId;
      const stepIndex = currentWorkflow.steps.findIndex(step => step.id === stepId);
      openConfirmModal('delete-step', stepIndex);
    });
  });
  
  // Add category selection
  const stepCategories = document.querySelectorAll('.step-category');
  stepCategories.forEach(category => {
    category.addEventListener('click', function() {
      stepCategories.forEach(cat => cat.classList.remove('active'));
      this.classList.add('active');
      
      // This would normally filter step blocks
      // For simplicity, we're not implementing filtering in this demo
    });
  });
  
  // Workflow list item actions
  document.querySelectorAll('.edit-workflow').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent workflow item click
      // Already editing the only workflow in this demo
      showToast('Info', 'Already editing this workflow', 'info');
    });
  });
  
  document.querySelectorAll('.run-workflow').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent workflow item click
      testWorkflow();
    });
  });
  
  document.querySelectorAll('.delete-workflow').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent workflow item click
      openConfirmModal('delete-workflow');
    });
  });
  
  // Workflow item click (select workflow)
  document.querySelectorAll('.workflow-item').forEach(item => {
    item.addEventListener('click', function() {
      document.querySelectorAll('.workflow-item').forEach(wi => wi.classList.remove('active'));
      this.classList.add('active');
      
      // In a real app, this would load the selected workflow
      // For demo, we're always showing the same workflow
    });
  });
  
  // Function to initialize drag and drop
  function initDragAndDrop() {
    // Make step blocks draggable
    const stepBlocks = document.querySelectorAll('.step-block');
    stepBlocks.forEach(block => {
      block.addEventListener('dragstart', handleDragStart);
      block.addEventListener('dragend', handleDragEnd);
    });
    
    // Make drop area accept drops
    const blockDropArea = document.querySelector('.block-drop-area');
    if (blockDropArea) {
      blockDropArea.addEventListener('dragover', handleDragOver);
      blockDropArea.addEventListener('dragenter', handleDragEnter);
      blockDropArea.addEventListener('dragleave', handleDragLeave);
      blockDropArea.addEventListener('drop', handleDrop);
    }
    
    // For existing steps, make them draggable and able to be reordered
    makeStepsDraggable();
    
    // Add click event for workflow blocks
    setupWorkflowBlockInteractions();
  }
  
  function makeStepsDraggable() {
    const workflowBlocks = document.querySelectorAll('.workflow-block');
    workflowBlocks.forEach(block => {
      block.setAttribute('draggable', 'true');
      block.addEventListener('dragstart', handleStepDragStart);
      block.addEventListener('dragend', handleStepDragEnd);
      block.addEventListener('dragover', handleStepDragOver);
      block.addEventListener('drop', handleStepDrop);
    });
  }
  
  function setupWorkflowBlockInteractions() {
    // Setup block click to open editor
    const workflowBlocks = document.querySelectorAll('.workflow-block');
    workflowBlocks.forEach(block => {
      block.querySelector('.block-content').addEventListener('click', function() {
        const stepId = block.dataset.stepId;
        const stepIndex = currentWorkflow.steps.findIndex(step => step.id === stepId);
        openStepModal(stepIndex);
      });
    });
    
    // Setup block action buttons
    document.querySelectorAll('.workflow-block .edit-step').forEach(button => {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        const block = this.closest('.workflow-block');
        const stepId = block.dataset.stepId;
        const stepIndex = currentWorkflow.steps.findIndex(step => step.id === stepId);
        openStepModal(stepIndex);
      });
    });
    
    document.querySelectorAll('.workflow-block .duplicate-step').forEach(button => {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        const block = this.closest('.workflow-block');
        const stepId = block.dataset.stepId;
        const stepIndex = currentWorkflow.steps.findIndex(step => step.id === stepId);
        duplicateStep(stepIndex);
      });
    });
    
    document.querySelectorAll('.workflow-block .delete-step').forEach(button => {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        const block = this.closest('.workflow-block');
        const stepId = block.dataset.stepId;
        const stepIndex = currentWorkflow.steps.findIndex(step => step.id === stepId);
        openConfirmModal('delete-step', stepIndex);
      });
    });
    
    // Setup URL field
    const urlField = document.querySelector('.url-field input');
    const urlButton = document.querySelector('.url-field button');
    
    if (urlField && urlButton) {
      // Pre-fill URL from first navigate step if available
      const navigateStep = currentWorkflow.steps.find(step => step.type === 'navigate');
      if (navigateStep && navigateStep.parameters.url) {
        urlField.value = navigateStep.parameters.url;
      }
      
      urlButton.addEventListener('click', function() {
        const url = urlField.value.trim();
        if (url) {
          // Either update existing navigate step or create new one
          const navigateStepIndex = currentWorkflow.steps.findIndex(step => step.type === 'navigate');
          
          if (navigateStepIndex >= 0) {
            // Update existing navigate step
            currentWorkflow.steps[navigateStepIndex].parameters.url = url;
          } else {
            // Create new navigate step at the beginning
            const newStepId = Date.now().toString();
            const newStep = {
              id: newStepId,
              type: 'navigate',
              parameters: {
                url: url
              }
            };
            currentWorkflow.steps.unshift(newStep);
          }
          
          renderWorkflowSteps();
          showToast('Success', 'URL updated successfully', 'success');
        } else {
          showToast('Error', 'Please enter a valid URL', 'error');
        }
      });
    }
  }
  
  // Drag and Drop handlers for step blocks (from sidebar to canvas)
  function handleDragStart(e) {
    this.classList.add('step-dragging');
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', this.dataset.stepType);
    
    // Create a custom ghost image (optional)
    const ghostElement = this.cloneNode(true);
    ghostElement.style.width = '200px';
    ghostElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 100, 20);
    setTimeout(() => document.body.removeChild(ghostElement), 0);
  }
  
  function handleDragEnd() {
    this.classList.remove('step-dragging');
  }
  
  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary to allow drop
    }
    e.dataTransfer.dropEffect = 'copy';
    return false;
  }
  
  function handleDragEnter() {
    this.classList.add('drop-active');
  }
  
  function handleDragLeave() {
    this.classList.remove('drop-active');
  }
  
  function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drop-active');
    
    const stepType = e.dataTransfer.getData('text/plain');
    if (stepType && stepTypeConfigs[stepType]) {
      const newStepId = Date.now().toString();
      const newStep = {
        id: newStepId,
        type: stepType,
        parameters: {}
      };
      
      // Add empty parameters based on step type
      switch (stepType) {
        case 'navigate':
          newStep.parameters.url = '';
          break;
        case 'click':
        case 'type':
        case 'wait':
          newStep.parameters.selector = '';
          if (stepType === 'type') {
            newStep.parameters.text = '';
          } else if (stepType === 'wait') {
            newStep.parameters.seconds = 5;
          }
          break;
        case 'screenshot':
          newStep.parameters.filename = 'screenshot_' + new Date().toISOString().replace(/[:.]/g, '_');
          break;
        case 'extract':
          newStep.parameters.selector = '';
          newStep.parameters.variableName = 'data';
          break;
      }
      
      // Add the new step to the workflow
      currentWorkflow.steps.push(newStep);
      
      // Open the step configuration modal
      openStepModal(currentWorkflow.steps.length - 1);
      
      // Render the workflow steps
      renderWorkflowSteps();
    }
    
    return false;
  }
  
  // Drag and Drop handlers for workflow steps (reordering)
  function handleStepDragStart(e) {
    this.classList.add('step-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.stepId);
    
    // Remember the source index
    e.dataTransfer.setData('application/json', JSON.stringify({
      sourceIndex: Array.from(this.parentNode.children).indexOf(this)
    }));
  }
  
  function handleStepDragEnd() {
    this.classList.remove('step-dragging');
    document.querySelectorAll('.workflow-step').forEach(step => {
      step.classList.remove('drag-over');
    });
  }
  
  function handleStepDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary to allow drop
    }
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
    return false;
  }
  
  function handleStepDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const sourceStepId = e.dataTransfer.getData('text/plain');
    const sourceData = JSON.parse(e.dataTransfer.getData('application/json'));
    const targetStepId = this.dataset.stepId;
    
    if (sourceStepId && targetStepId && sourceStepId !== targetStepId) {
      // Get the target index
      const targetIndex = Array.from(this.parentNode.children).indexOf(this);
      
      // Reorder the steps in the workflow
      const stepToMove = currentWorkflow.steps.splice(sourceData.sourceIndex, 1)[0];
      currentWorkflow.steps.splice(targetIndex, 0, stepToMove);
      
      // Render the updated steps
      renderWorkflowSteps();
    }
    
    return false;
  }
  
  // Render the workflow steps
  function renderWorkflowSteps() {
    // Get the workflow blocks container
    const workflowBlocks = document.querySelector('.workflow-blocks');
    if (!workflowBlocks) return;
    
    // Clear all blocks except the drop area
    const blocksToRemove = document.querySelectorAll('.workflow-block');
    blocksToRemove.forEach(block => block.remove());
    
    // Get the drop area reference
    const blockDropArea = document.querySelector('.block-drop-area');
    
    // Add each step as a block to the workflow
    currentWorkflow.steps.forEach((step, index) => {
      const blockElement = createBlockElement(step, index);
      workflowBlocks.insertBefore(blockElement, blockDropArea);
    });
    
    // Make the newly added blocks draggable
    makeStepsDraggable();
    
    // Set up interactions
    setupWorkflowBlockInteractions();
    
    // Update the URL field if there's a navigate step
    const urlField = document.querySelector('.url-field input');
    if (urlField) {
      const navigateStep = currentWorkflow.steps.find(step => step.type === 'navigate');
      if (navigateStep && navigateStep.parameters.url) {
        urlField.value = navigateStep.parameters.url;
      }
    }
  }
  
  // Create a block element for the new UI
  function createBlockElement(step, index) {
    const stepConfig = stepTypeConfigs[step.type] || {
      icon: 'fas fa-question',
      title: 'Unknown Step'
    };
    
    // Get a short label for the block based on the step type
    let blockLabel = stepConfig.title;
    
    // For some steps, show a more helpful label
    if (step.type === 'navigate' && step.parameters.url) {
      // Show domain name for navigate
      try {
        const url = new URL(step.parameters.url);
        blockLabel = url.hostname;
      } catch (e) {
        blockLabel = 'Điều hướng';
      }
    } else if (step.type === 'type' && step.parameters.selector) {
      // Show selector for type
      blockLabel = `Nhập: ${step.parameters.selector}`;
    } else if (step.type === 'click' && step.parameters.selector) {
      // Show selector for click
      blockLabel = `Click: ${step.parameters.selector}`;
    }
    
    const blockElement = document.createElement('div');
    blockElement.className = 'workflow-block';
    blockElement.dataset.stepId = step.id;
    blockElement.setAttribute('draggable', 'true');
    
    // Don't add arrow to the last step
    const isLastStep = index === currentWorkflow.steps.length - 1;
    
    blockElement.innerHTML = `
      <div class="block-content">
        <div class="block-label">${blockLabel}</div>
      </div>
      ${!isLastStep ? '<div class="block-arrow"><i class="fas fa-arrow-down"></i></div>' : ''}
      <div class="block-actions">
        <button class="edit-step" title="Edit"><i class="fas fa-pencil-alt"></i></button>
        <button class="duplicate-step" title="Duplicate"><i class="fas fa-copy"></i></button>
        <button class="delete-step" title="Delete"><i class="fas fa-times"></i></button>
      </div>
    `;
    
    return blockElement;
  }
  
  // Open the step configuration modal
  function openStepModal(stepIndex) {
    editingStepIndex = stepIndex;
    const step = currentWorkflow.steps[stepIndex];
    const stepConfig = stepTypeConfigs[step.type];
    
    stepModalTitle.textContent = `${stepIndex === -1 ? 'Thêm' : 'Chỉnh sửa'} ${stepConfig.title}`;
    stepModalBody.innerHTML = stepConfig.formTemplate;
    
    // Fill in existing parameter values
    for (const [key, value] of Object.entries(step.parameters)) {
      const input = document.getElementById(key);
      if (input) {
        input.value = value;
      }
    }
    
    stepModal.classList.remove('hidden');
  }
  
  // Close the step configuration modal
  function closeStepModal() {
    stepModal.classList.add('hidden');
    editingStepIndex = -1;
  }
  
  // Save the step configuration
  function saveStep() {
    if (editingStepIndex === -1) return;
    
    const step = currentWorkflow.steps[editingStepIndex];
    const stepConfig = stepTypeConfigs[step.type];
    
    // Generate parameters from form
    const newParams = stepConfig.generateParams();
    
    // Validate parameters
    if (!stepConfig.validateParams(newParams)) {
      showToast('Error', 'Please fill in all required fields correctly.', 'error');
      return;
    }
    
    // Update the step
    step.parameters = newParams;
    
    // Close the modal
    closeStepModal();
    
    // Re-render the workflow
    renderWorkflowSteps();
    
    showToast('Success', 'Step saved successfully!', 'success');
  }
  
  // Duplicate a step
  function duplicateStep(index) {
    const step = currentWorkflow.steps[index];
    const newStep = JSON.parse(JSON.stringify(step)); // Deep clone
    newStep.id = Date.now().toString();
    
    // Insert after the original
    currentWorkflow.steps.splice(index + 1, 0, newStep);
    
    // Render the updated steps
    renderWorkflowSteps();
    
    showToast('Success', 'Step duplicated successfully!', 'success');
  }
  
  // Delete a step
  function deleteStep(index) {
    currentWorkflow.steps.splice(index, 1);
    renderWorkflowSteps();
    showToast('Success', 'Step deleted successfully!', 'success');
  }
  
  // Open the confirmation modal
  function openConfirmModal(action, stepIndex) {
    if (action === 'delete-step') {
      deletingStepIndex = stepIndex;
      confirmMessage.textContent = 'Bạn có chắc chắn muốn xóa bước này?';
    } else if (action === 'delete-workflow') {
      confirmMessage.textContent = 'Bạn có chắc chắn muốn xóa workflow này?';
    }
    
    confirmActionBtn.dataset.action = action;
    confirmModal.classList.remove('hidden');
  }
  
  // Close the confirmation modal
  function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    deletingStepIndex = -1;
  }
  
  // Confirm an action
  function confirmAction() {
    const action = confirmActionBtn.dataset.action;
    
    if (action === 'delete-step' && deletingStepIndex !== -1) {
      deleteStep(deletingStepIndex);
    } else if (action === 'delete-workflow') {
      showToast('Info', 'This is a demo - cannot delete the only workflow', 'info');
    }
    
    closeConfirmModal();
  }
  
  // Save the current workflow
  function saveWorkflow() {
    // Validate workflow
    if (!currentWorkflow.name.trim()) {
      showToast('Error', 'Please provide a name for the workflow.', 'error');
      return;
    }
    
    if (currentWorkflow.steps.length === 0) {
      showToast('Error', 'Workflow must have at least one step.', 'error');
      return;
    }
    
    // In a real app, this would send the workflow to the server
    // For demo, just show a success message
    showToast('Success', 'Workflow saved successfully!', 'success');
    
    // Update the workflow name in the list
    const workflowItem = document.querySelector('.workflow-item.active .workflow-name');
    if (workflowItem) {
      workflowItem.textContent = currentWorkflow.name;
    }
  }
  
  // Test the current workflow
  function testWorkflow() {
    // Validate workflow before testing
    if (!currentWorkflow.name.trim()) {
      showToast('Error', 'Please provide a name for the workflow.', 'error');
      return;
    }
    
    if (currentWorkflow.steps.length === 0) {
      showToast('Error', 'Workflow must have at least one step.', 'error');
      return;
    }
    
    // Update workflow status in UI
    const statusIcon = document.querySelector('.workflow-item.active .workflow-status');
    if (statusIcon) {
      statusIcon.className = 'workflow-status running';
      statusIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    // For demo purposes, simulate a workflow run
    showToast('Info', 'Executing workflow...', 'info');
    
    // After a delay, update status to either success or error
    setTimeout(() => {
      if (statusIcon) {
        const success = Math.random() > 0.2; // 80% chance of success
        statusIcon.className = `workflow-status ${success ? 'success' : 'error'}`;
        statusIcon.innerHTML = `<i class="fas fa-${success ? 'check' : 'times'}-circle"></i>`;
        
        showToast(
          success ? 'Success' : 'Error',
          success ? 'Workflow executed successfully!' : 'Workflow execution failed.',
          success ? 'success' : 'error'
        );
      }
    }, 3000);
  }
  
  // Create a new workflow
  function createNewWorkflow() {
    // In a real app, this would create a new workflow
    // For demo, just show info message
    showToast('Info', 'This is a demo - new workflow creation is limited. You can edit the current workflow.', 'info');
  }
  
  // Toast notification
  function showToast(title, message, type = 'info') {
    // For demo, use the global showToast function from app.js
    if (typeof window.showToast === 'function') {
      window.showToast(title, message, type);
    } else {
      // Fallback if global function is not available
      console.log(`${type.toUpperCase()}: ${title} - ${message}`);
      alert(`${title}: ${message}`);
    }
  }
});