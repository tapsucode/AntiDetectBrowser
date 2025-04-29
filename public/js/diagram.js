document.addEventListener('DOMContentLoaded', function() {
  // References to diagram elements
  const diagramGrid = document.getElementById('diagram-grid');
  const zoomIn = document.getElementById('zoom-in');
  const zoomOut = document.getElementById('zoom-out');
  const zoomLevelDisplay = document.getElementById('zoom-level');
  const showGridToggle = document.getElementById('show-grid-toggle');
  const autoArrange = document.getElementById('auto-arrange');
  const centerView = document.getElementById('center-view');
  const stepBlocks = document.querySelectorAll('.step-block');
  
  // Current diagram state
  let zoomLevel = 1;
  let isPanning = false;
  let startPanX = 0;
  let startPanY = 0;
  let currentTranslateX = 0;
  let currentTranslateY = 0;
  
  // Active elements
  let activeNode = null;
  let activeDraggingNode = null;
  let isCreatingConnection = false;
  let connectionStartAnchor = null;
  let mouseX = 0;
  let mouseY = 0;
  let ghostElement = null;
  let nextNodeId = 6; // Start after existing nodes
  
  // Track connections
  let connections = [];
  
  // Initialize the diagram
  initDiagram();
  
  function initDiagram() {
    if (!diagramGrid) return;
    
    // Initialize nodes
    initNodes();
    
    // Initialize sidebar step blocks for drag-and-drop
    initStepBlocks();
    
    // Initialize panning
    diagramGrid.addEventListener('mousedown', startPan);
    document.addEventListener('mousemove', duringPan);
    document.addEventListener('mouseup', endPan);
    
    // Initialize zoom controls
    zoomIn.addEventListener('click', () => {
      updateZoom(zoomLevel + 0.1);
    });
    
    zoomOut.addEventListener('click', () => {
      updateZoom(zoomLevel - 0.1);
    });
    
    // Initialize grid toggle
    showGridToggle.addEventListener('click', toggleGrid);
    
    // Initialize auto arrange
    autoArrange.addEventListener('click', arrangeNodesAutomatically);
    
    // Initialize center view
    centerView.addEventListener('click', centerDiagramView);
    
    // Initialize mouse position tracking (for line drawing)
    diagramGrid.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (isCreatingConnection) {
        updateTemporaryConnection();
      }
      
      // Update ghost node position during drag
      if (ghostElement) {
        updateGhostNodePosition(e);
      }
    });
    
    // Handle drop on the diagram grid
    diagramGrid.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    
    diagramGrid.addEventListener('drop', handleDiagramDrop);
    
    // Make diagram zoomable with mousewheel
    diagramGrid.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        updateZoom(zoomLevel + delta);
      }
    });
    
    // Populate initial connections data
    storeExistingConnections();
  }
  
  function initStepBlocks() {
    // Make blocks from the sidebar draggable onto the diagram
    stepBlocks.forEach(block => {
      block.addEventListener('dragstart', (e) => {
        const stepType = block.dataset.stepType;
        e.dataTransfer.setData('application/json', JSON.stringify({
          type: stepType,
          source: 'sidebar'
        }));
        
        // Create ghost element for visual feedback
        createGhostElement(e, block);
      });
      
      block.addEventListener('dragend', () => {
        if (ghostElement && ghostElement.parentNode) {
          ghostElement.parentNode.removeChild(ghostElement);
        }
        ghostElement = null;
      });
    });
  }
  
  function createGhostElement(e, sourceBlock) {
    // Create a visual ghost element that follows the cursor
    ghostElement = sourceBlock.cloneNode(true);
    ghostElement.style.position = 'absolute';
    ghostElement.style.zIndex = '1000';
    ghostElement.style.pointerEvents = 'none';
    ghostElement.style.opacity = '0.6';
    ghostElement.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(ghostElement);
    
    // Position the ghost element
    updateGhostNodePosition(e);
  }
  
  function updateGhostNodePosition(e) {
    if (!ghostElement) return;
    
    ghostElement.style.left = e.clientX + 'px';
    ghostElement.style.top = e.clientY + 'px';
  }
  
  function handleDiagramDrop(e) {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!data || data.source !== 'sidebar') return;
      
      // Get drop position relative to diagram grid
      const rect = diagramGrid.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoomLevel;
      const y = (e.clientY - rect.top) / zoomLevel;
      
      // Create new node
      createNodeFromType(data.type, x, y);
      
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }
  
  function createNodeFromType(type, x, y) {
    const nodeId = `node_${nextNodeId++}`;
    let nodeHTML = '';
    let nodeType = '';
    let nodeClass = '';
    let icon = '';
    let label = '';
    
    // Determine node appearance based on type
    switch (type) {
      case 'navigate':
        nodeType = 'navigate';
        nodeClass = 'action-node';
        icon = 'fas fa-globe';
        label = 'Điều hướng';
        break;
      case 'click':
        nodeType = 'click';
        nodeClass = 'action-node';
        icon = 'fas fa-mouse-pointer';
        label = 'Click';
        break;
      case 'type':
        nodeType = 'type';
        nodeClass = 'action-node';
        icon = 'fas fa-keyboard';
        label = 'Nhập văn bản';
        break;
      case 'wait':
        nodeType = 'wait';
        nodeClass = 'action-node';
        icon = 'fas fa-clock';
        label = 'Chờ đợi';
        break;
      case 'screenshot':
        nodeType = 'screenshot';
        nodeClass = 'action-node';
        icon = 'fas fa-camera';
        label = 'Chụp màn hình';
        break;
      case 'extract':
        nodeType = 'extract';
        nodeClass = 'action-node';
        icon = 'fas fa-copy';
        label = 'Trích xuất';
        break;
      case 'loop':
        nodeType = 'loop';
        nodeClass = 'decision-node';
        icon = 'fas fa-sync';
        label = 'Loop';
        break;
      default:
        nodeType = 'unknown';
        nodeClass = 'action-node';
        icon = 'fas fa-question';
        label = 'Khối mới';
    }
    
    // Create the node HTML
    const node = document.createElement('div');
    node.className = `workflow-node ${nodeClass}`;
    node.dataset.nodeId = nodeId;
    node.dataset.nodeType = nodeType;
    node.style.left = `${x - 50}px`; // Center the node at the drop position
    node.style.top = `${y - 25}px`;
    
    // Determine anchors based on node type
    let anchorsHtml = '';
    if (nodeClass === 'decision-node') {
      anchorsHtml = `
        <div class="node-anchor input-anchor" data-anchor-type="input"></div>
        <div class="node-anchor output-anchor" data-anchor-type="output-true"></div>
        <div class="node-anchor output-anchor alt-output" data-anchor-type="output-false"></div>
      `;
    } else {
      anchorsHtml = `
        <div class="node-anchor input-anchor" data-anchor-type="input"></div>
        <div class="node-anchor output-anchor" data-anchor-type="output"></div>
      `;
    }
    
    node.innerHTML = `
      <div class="node-content">
        <div class="node-icon"><i class="${icon}"></i></div>
        <div class="node-label">${label}</div>
      </div>
      ${anchorsHtml}
      <div class="node-actions">
        <button class="edit-node"><i class="fas fa-pencil-alt"></i></button>
        <button class="delete-node"><i class="fas fa-trash"></i></button>
      </div>
    `;
    
    // Add the node to the diagram
    diagramGrid.appendChild(node);
    
    // Initialize the node events
    node.addEventListener('mousedown', startNodeDrag);
    node.addEventListener('click', selectNode);
    
    // Initialize node buttons
    const editBtn = node.querySelector('.edit-node');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openNodeEditor(node);
      });
    }
    
    const deleteBtn = node.querySelector('.delete-node');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNode(node);
      });
    }
    
    // Initialize node anchors
    const anchors = node.querySelectorAll('.node-anchor');
    anchors.forEach(anchor => {
      anchor.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startConnection(anchor);
      });
      
      anchor.addEventListener('mouseup', (e) => {
        endConnection(anchor);
      });
    });
    
    return node;
  }
  
  function storeExistingConnections() {
    // Store the initial connection information for easy reference
    const connectionPaths = document.querySelectorAll('.connection:not(.temp-connection)');
    connectionPaths.forEach(path => {
      const outputNodeId = path.getAttribute('data-output-node');
      const inputNodeId = path.getAttribute('data-input-node');
      
      if (outputNodeId && inputNodeId) {
        connections.push({
          outputNodeId,
          inputNodeId,
          path,
          isAlternate: path.classList.contains('alt-path')
        });
      }
    });
  }
  
  function initNodes() {
    // Make nodes draggable
    const nodes = document.querySelectorAll('.workflow-node');
    nodes.forEach(node => {
      // Dragging nodes
      node.addEventListener('mousedown', startNodeDrag);
      
      // Node selection
      node.addEventListener('click', selectNode);
      
      // Edit node button
      const editBtn = node.querySelector('.edit-node');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openNodeEditor(node);
        });
      }
      
      // Delete node button
      const deleteBtn = node.querySelector('.delete-node');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteNode(node);
        });
      }
      
      // Initialize anchors
      const anchors = node.querySelectorAll('.node-anchor');
      anchors.forEach(anchor => {
        anchor.addEventListener('mousedown', (e) => {
          e.stopPropagation(); // Don't trigger node drag
          startConnection(anchor);
        });
        
        anchor.addEventListener('mouseup', (e) => {
          endConnection(anchor);
        });
      });
    });
  }
  
  // Pan functions
  function startPan(e) {
    if (activeDraggingNode || isCreatingConnection || e.target.closest('.workflow-node') || e.target.closest('.node-anchor')) {
      return; // Don't start panning if we're doing something else
    }
    
    isPanning = true;
    startPanX = e.clientX - currentTranslateX;
    startPanY = e.clientY - currentTranslateY;
    diagramGrid.style.cursor = 'grabbing';
  }
  
  function duringPan(e) {
    if (!isPanning) return;
    
    currentTranslateX = e.clientX - startPanX;
    currentTranslateY = e.clientY - startPanY;
    diagramGrid.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${zoomLevel})`;
  }
  
  function endPan() {
    isPanning = false;
    diagramGrid.style.cursor = 'default';
  }
  
  // Node dragging functions
  function startNodeDrag(e) {
    if (e.target.closest('.node-anchor') || e.target.closest('.node-actions')) {
      return; // Ignore if clicking on anchors or action buttons
    }
    
    const node = e.currentTarget;
    activeDraggingNode = node;
    
    // Store the initial position
    const rect = node.getBoundingClientRect();
    const gridRect = diagramGrid.getBoundingClientRect();
    
    // Calculate node position relative to the grid
    const left = node.style.left ? parseInt(node.style.left) : 0;
    const top = node.style.top ? parseInt(node.style.top) : 0;
    
    node.dataset.dragOffsetX = e.clientX - rect.left;
    node.dataset.dragOffsetY = e.clientY - rect.top;
    node.dataset.originalLeft = left;
    node.dataset.originalTop = top;
    
    // Add dragging class
    node.classList.add('dragging');
    
    // Add document-level event listeners
    document.addEventListener('mousemove', dragNode);
    document.addEventListener('mouseup', stopNodeDrag);
  }
  
  function dragNode(e) {
    if (!activeDraggingNode) return;
    
    const node = activeDraggingNode;
    const offsetX = parseFloat(node.dataset.dragOffsetX);
    const offsetY = parseFloat(node.dataset.dragOffsetY);
    
    // Calculate new position
    const gridRect = diagramGrid.getBoundingClientRect();
    const x = (e.clientX - gridRect.left - offsetX) / zoomLevel;
    const y = (e.clientY - gridRect.top - offsetY) / zoomLevel;
    
    // Update node position
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    
    // Only update connections related to this node for better performance during drag
    updateNodeConnections(node);
  }
  
  function updateNodeConnections(node) {
    if (!node) return;
    
    const nodeId = node.dataset.nodeId;
    
    // Find connections where this node is source or target
    const relatedConnections = connections.filter(connection => 
      connection.outputNodeId === nodeId || connection.inputNodeId === nodeId
    );
    
    // Update those connections
    relatedConnections.forEach(connection => {
      const outputNode = document.querySelector(`.workflow-node[data-node-id="${connection.outputNodeId}"]`);
      const inputNode = document.querySelector(`.workflow-node[data-node-id="${connection.inputNodeId}"]`);
      
      if (!outputNode || !inputNode) return;
      
      const outputAnchor = connection.isAlternate 
        ? outputNode.querySelector('.output-anchor.alt-output') 
        : outputNode.querySelector('.output-anchor:not(.alt-output)');
      
      const inputAnchor = inputNode.querySelector('.input-anchor');
      
      if (!outputAnchor || !inputAnchor) return;
      
      updateConnectionPath(connection.path, outputAnchor, inputAnchor);
    });
  }
  
  function stopNodeDrag() {
    if (!activeDraggingNode) return;
    
    activeDraggingNode.classList.remove('dragging');
    activeDraggingNode = null;
    
    document.removeEventListener('mousemove', dragNode);
    document.removeEventListener('mouseup', stopNodeDrag);
  }
  
  // Select a node
  function selectNode(e) {
    // Deselect currently selected node
    const selectedNode = document.querySelector('.workflow-node.selected');
    if (selectedNode) {
      selectedNode.classList.remove('selected');
    }
    
    // Select the clicked node
    const node = e.currentTarget;
    node.classList.add('selected');
    activeNode = node;
  }
  
  // Connection functions
  function startConnection(anchor) {
    isCreatingConnection = true;
    connectionStartAnchor = anchor;
    
    // Create a temporary SVG path for visual feedback
    const connectionsLayer = document.querySelector('.connections-layer');
    if (connectionsLayer) {
      const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempPath.setAttribute('class', 'connection temp-connection');
      tempPath.setAttribute('id', 'temp-connection');
      connectionsLayer.appendChild(tempPath);
      
      // Initial update
      updateTemporaryConnection();
    }
  }
  
  function updateTemporaryConnection() {
    if (!isCreatingConnection || !connectionStartAnchor) return;
    
    const tempPath = document.getElementById('temp-connection');
    if (!tempPath) return;
    
    // Get start anchor position
    const startAnchor = connectionStartAnchor;
    const startRect = startAnchor.getBoundingClientRect();
    const connectionsLayer = document.querySelector('.connections-layer');
    const layerRect = connectionsLayer.getBoundingClientRect();
    
    // Calculate start point (center of the anchor)
    const startX = (startRect.left + startRect.width / 2 - layerRect.left) / zoomLevel;
    const startY = (startRect.top + startRect.height / 2 - layerRect.top) / zoomLevel;
    
    // End point is the current mouse position
    const endX = (mouseX - layerRect.left) / zoomLevel;
    const endY = (mouseY - layerRect.top) / zoomLevel;
    
    // Create path
    const path = createConnectionPath(startX, startY, endX, endY);
    tempPath.setAttribute('d', path);
  }
  
  function endConnection(anchor) {
    if (!isCreatingConnection || !connectionStartAnchor) return;
    
    // Check if the connection is valid (e.g., start to input, output to input)
    const startAnchorType = connectionStartAnchor.dataset.anchorType;
    const endAnchorType = anchor.dataset.anchorType;
    
    // Only allow connections from output to input
    if ((startAnchorType.includes('output') && endAnchorType.includes('input')) ||
        (startAnchorType.includes('input') && endAnchorType.includes('output'))) {
      
      // Add permanent connection
      createConnection(
        startAnchorType.includes('output') ? connectionStartAnchor : anchor,
        startAnchorType.includes('output') ? anchor : connectionStartAnchor
      );
    }
    
    // Clean up
    const tempPath = document.getElementById('temp-connection');
    if (tempPath) {
      tempPath.remove();
    }
    
    isCreatingConnection = false;
    connectionStartAnchor = null;
  }
  
  function createConnection(outputAnchor, inputAnchor) {
    const connectionsLayer = document.querySelector('.connections-layer');
    if (!connectionsLayer) return;
    
    // Get anchor positions
    const outputNode = outputAnchor.closest('.workflow-node');
    const inputNode = inputAnchor.closest('.workflow-node');
    
    if (!outputNode || !inputNode) return;
    
    // Check if a connection already exists between these nodes
    const existingConnection = Array.from(connectionsLayer.querySelectorAll('.connection')).find(path => {
      return path.getAttribute('data-output-node') === outputNode.dataset.nodeId && 
             path.getAttribute('data-input-node') === inputNode.dataset.nodeId;
    });
    
    if (existingConnection) {
      // Just update the existing connection path
      updateConnectionPath(existingConnection, outputAnchor, inputAnchor);
      return existingConnection;
    }
    
    // Create SVG path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'connection');
    path.setAttribute('data-output-node', outputNode.dataset.nodeId);
    path.setAttribute('data-input-node', inputNode.dataset.nodeId);
    
    // Add special class if the connection is from a decision node
    if (outputNode.classList.contains('decision-node') && outputAnchor.classList.contains('alt-output')) {
      path.classList.add('alt-path');
    } else if (outputNode.classList.contains('decision-node')) {
      path.classList.add('success-path');
    }
    
    connectionsLayer.appendChild(path);
    
    // Update the path coordinates
    updateConnectionPath(path, outputAnchor, inputAnchor);
    
    // Track this connection
    connections.push({
      outputNodeId: outputNode.dataset.nodeId,
      inputNodeId: inputNode.dataset.nodeId,
      path: path,
      isAlternate: path.classList.contains('alt-path')
    });
    
    return path;
  }
  
  function updateConnections() {
    // Update all existing connection paths to match node positions
    connections.forEach(connection => {
      const outputNodeId = connection.outputNodeId;
      const inputNodeId = connection.inputNodeId;
      
      const outputNode = document.querySelector(`.workflow-node[data-node-id="${outputNodeId}"]`);
      const inputNode = document.querySelector(`.workflow-node[data-node-id="${inputNodeId}"]`);
      
      if (!outputNode || !inputNode) return;
      
      const outputAnchor = connection.isAlternate 
        ? outputNode.querySelector('.output-anchor.alt-output') 
        : outputNode.querySelector('.output-anchor:not(.alt-output)');
      
      const inputAnchor = inputNode.querySelector('.input-anchor');
      
      if (!outputAnchor || !inputAnchor) return;
      
      updateConnectionPath(connection.path, outputAnchor, inputAnchor);
    });
    
    // Also update any connections not in our tracked array (fallback)
    const connectionPaths = document.querySelectorAll('.connection:not(.temp-connection)');
    connectionPaths.forEach(path => {
      const outputNodeId = path.getAttribute('data-output-node');
      const inputNodeId = path.getAttribute('data-input-node');
      
      // Skip if we already have this connection in our array
      if (connections.some(c => c.path === path)) return;
      
      if (!outputNodeId || !inputNodeId) return;
      
      const outputNode = document.querySelector(`.workflow-node[data-node-id="${outputNodeId}"]`);
      const inputNode = document.querySelector(`.workflow-node[data-node-id="${inputNodeId}"]`);
      
      if (!outputNode || !inputNode) return;
      
      const outputAnchor = path.classList.contains('alt-path') 
        ? outputNode.querySelector('.output-anchor.alt-output') 
        : outputNode.querySelector('.output-anchor:not(.alt-output)');
      
      const inputAnchor = inputNode.querySelector('.input-anchor');
      
      if (!outputAnchor || !inputAnchor) return;
      
      updateConnectionPath(path, outputAnchor, inputAnchor);
      
      // Add to our array for future updates
      connections.push({
        outputNodeId,
        inputNodeId,
        path,
        isAlternate: path.classList.contains('alt-path')
      });
    });
  }
  
  function updateConnectionPath(path, outputAnchor, inputAnchor) {
    const connectionsLayer = document.querySelector('.connections-layer');
    if (!connectionsLayer) return;
    
    const layerRect = connectionsLayer.getBoundingClientRect();
    
    // Get positions
    const outputRect = outputAnchor.getBoundingClientRect();
    const inputRect = inputAnchor.getBoundingClientRect();
    
    // Calculate points
    const startX = (outputRect.left + outputRect.width / 2 - layerRect.left) / zoomLevel;
    const startY = (outputRect.top + outputRect.height / 2 - layerRect.top) / zoomLevel;
    const endX = (inputRect.left + inputRect.width / 2 - layerRect.left) / zoomLevel;
    const endY = (inputRect.top + inputRect.height / 2 - layerRect.top) / zoomLevel;
    
    // Create path
    const pathData = createConnectionPath(startX, startY, endX, endY);
    path.setAttribute('d', pathData);
  }
  
  function createConnectionPath(startX, startY, endX, endY) {
    // Calculate control points for a bezier curve
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    
    let controlX1, controlY1, controlX2, controlY2;
    
    if (dx > dy) {
      // Horizontal-dominant path
      controlX1 = startX + dx * 0.25;
      controlY1 = startY;
      controlX2 = endX - dx * 0.25;
      controlY2 = endY;
    } else {
      // Vertical-dominant path
      controlX1 = startX;
      controlY1 = startY + dy * 0.25;
      controlX2 = endX;
      controlY2 = endY - dy * 0.25;
    }
    
    // For short distances, use a simple curve
    if (dx < 50 && dy < 50) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
    
    return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
  }
  
  // Node operations
  function openNodeEditor(node) {
    // In a real app, you would open a modal to edit the node
    const nodeId = node.dataset.nodeId;
    const nodeType = node.dataset.nodeType;
    console.log(`Edit node: ${nodeId} (${nodeType})`);
    
    // For demo, just change the node label
    const nodeLabel = node.querySelector('.node-label');
    if (nodeLabel) {
      const newLabel = prompt('Enter new label:', nodeLabel.textContent);
      if (newLabel) {
        nodeLabel.textContent = newLabel;
      }
    }
  }
  
  function deleteNode(node) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this node?')) {
      return;
    }
    
    const nodeId = node.dataset.nodeId;
    
    // Find related connections in the DOM
    const connectionElements = document.querySelectorAll(`
      .connection[data-output-node="${nodeId}"], 
      .connection[data-input-node="${nodeId}"]
    `);
    
    // Remove the connections from the DOM
    connectionElements.forEach(connection => {
      connection.remove();
    });
    
    // Update our connection tracking array by removing any connections to/from this node
    connections = connections.filter(connection => 
      connection.outputNodeId !== nodeId && connection.inputNodeId !== nodeId
    );
    
    // Remove the node
    node.remove();
  }
  
  // Utility functions
  function updateZoom(newZoom) {
    // Limit zoom level
    newZoom = Math.min(Math.max(newZoom, 0.3), 2);
    zoomLevel = newZoom;
    
    // Update grid scale
    diagramGrid.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${zoomLevel})`;
    
    // Update zoom level display
    if (zoomLevelDisplay) {
      zoomLevelDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
  }
  
  function toggleGrid() {
    showGridToggle.classList.toggle('active');
    diagramGrid.classList.toggle('hide-grid');
  }
  
  function arrangeNodesAutomatically() {
    // Simple automatic arrangement in levels
    const nodes = document.querySelectorAll('.workflow-node');
    
    // Group nodes by type
    const startNodes = document.querySelectorAll('.start-node');
    const actionNodes = document.querySelectorAll('.action-node');
    const decisionNodes = document.querySelectorAll('.decision-node');
    const endNodes = document.querySelectorAll('.end-node');
    
    // Position nodes
    const levelSpacing = 200;
    const nodeSpacing = 120;
    
    // Start nodes
    Array.from(startNodes).forEach((node, index) => {
      node.style.left = '30px';
      node.style.top = `${50 + index * nodeSpacing}px`;
    });
    
    // Action nodes
    Array.from(actionNodes).forEach((node, index) => {
      node.style.left = `${levelSpacing}px`;
      node.style.top = `${50 + index * nodeSpacing}px`;
    });
    
    // Decision nodes
    Array.from(decisionNodes).forEach((node, index) => {
      node.style.left = `${levelSpacing * 2}px`;
      node.style.top = `${80 + index * (nodeSpacing + 40)}px`;
    });
    
    // End nodes
    Array.from(endNodes).forEach((node, index) => {
      node.style.left = `${levelSpacing * 3}px`;
      node.style.top = `${50 + index * nodeSpacing}px`;
    });
    
    // Update connections
    updateConnections();
  }
  
  function centerDiagramView() {
    // Reset the transform
    currentTranslateX = 0;
    currentTranslateY = 0;
    diagramGrid.style.transform = `translate(0px, 0px) scale(${zoomLevel})`;
  }
});