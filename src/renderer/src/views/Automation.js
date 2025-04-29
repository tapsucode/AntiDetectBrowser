import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const AutomationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h1 {
    font-size: 1.8rem;
    font-weight: 600;
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.primary ? 'var(--color-accent)' : 'transparent'};
  color: ${props => props.primary ? 'white' : 'var(--color-text-secondary)'};
  border: ${props => props.primary ? 'none' : '1px solid var(--color-border)'};
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--color-accent-hover)' : 'var(--color-border)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const WorkflowsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const WorkflowCard = styled.div`
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const WorkflowHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  
  .workflow-title {
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .workflow-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background-color: rgba(77, 118, 253, 0.15);
      color: var(--color-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
  
  .workflow-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
    background-color: ${props => {
      switch(props.status) {
        case 'running': return 'rgba(74, 222, 128, 0.15)';
        case 'error': return 'rgba(248, 113, 113, 0.15)';
        case 'completed': return 'rgba(99, 102, 241, 0.15)';
        default: return 'rgba(148, 163, 184, 0.15)';
      }
    }};
    color: ${props => {
      switch(props.status) {
        case 'running': return '#4ade80';
        case 'error': return '#f87171';
        case 'completed': return '#6366f1';
        default: return '#94a3b8';
      }
    }};
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: ${props => {
        switch(props.status) {
          case 'running': return '#4ade80';
          case 'error': return '#f87171';
          case 'completed': return '#6366f1';
          default: return '#94a3b8';
        }
      }};
    }
  }
`;

const WorkflowBody = styled.div`
  padding: 1.25rem;
  
  .workflow-details {
    margin-bottom: 1.25rem;
    
    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      
      svg {
        width: 18px;
        height: 18px;
        color: var(--color-text-secondary);
        margin-top: 0.1rem;
      }
      
      .detail-content {
        .detail-label {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          margin-bottom: 0.25rem;
        }
        
        .detail-value {
          font-size: 0.95rem;
          color: var(--color-text-primary);
        }
      }
    }
  }
  
  .workflow-steps {
    border-top: 1px solid var(--color-border);
    padding-top: 1.25rem;
    
    .steps-header {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }
    
    .step-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      
      .step-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        
        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: var(--color-border);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .step-content {
          flex: 1;
          background-color: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 0.75rem;
          font-size: 0.9rem;
          color: var(--color-text-primary);
          font-family: monospace;
        }
      }
    }
  }
`;

const WorkflowFooter = styled.div`
  padding: 1.25rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .workflow-actions {
    display: flex;
    gap: 0.75rem;
  }
  
  .workflow-meta {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }
`;

const LogViewer = styled.div`
  margin-top: 1.5rem;
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  
  .log-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h2 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .log-actions {
      display: flex;
      gap: 0.5rem;
    }
  }
  
  .log-content {
    background-color: #1e1e2e;
    color: #cdd6f4;
    border-radius: 0 0 8px 8px;
    padding: 1rem;
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    white-space: pre-wrap;
  }
  
  .log-entry {
    margin-bottom: 0.5rem;
    
    &.info {
      color: #89b4fa;
    }
    
    &.success {
      color: #a6e3a1;
    }
    
    &.error {
      color: #f38ba8;
    }
    
    &.warning {
      color: #fab387;
    }
    
    .log-timestamp {
      color: #6c7086;
      margin-right: 0.5rem;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  text-align: center;
  
  svg {
    width: 64px;
    height: 64px;
    color: var(--color-text-secondary);
    opacity: 0.5;
    margin-bottom: 1.5rem;
  }
  
  .empty-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .empty-description {
    color: var(--color-text-secondary);
    font-size: 1rem;
    margin-bottom: 1.5rem;
    max-width: 400px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--color-bg-primary);
  border-radius: 10px;
  width: 95%;
  max-width: 700px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }
  
  button {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    
    &:hover {
      color: var(--color-text-primary);
    }
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  max-height: 70vh;
  overflow-y: auto;
  
  .form-group {
    margin-bottom: 1.25rem;
    
    label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    input, select, textarea {
      width: 100%;
      padding: 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
      font-size: 0.95rem;
      
      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }
    }
    
    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236e6e80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 16px;
      padding-right: 2.5rem;
    }
    
    textarea {
      min-height: 100px;
      font-family: monospace;
    }
    
    .helper-text {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }
  }
  
  .steps-container {
    margin-bottom: 1.25rem;
    
    .steps-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h3 {
        font-size: 1rem;
        font-weight: 500;
        margin: 0;
      }
      
      button {
        background-color: transparent;
        border: none;
        color: var(--color-accent);
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        
        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
    
    .step-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      
      .step-item {
        background-color: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 1rem;
        position: relative;
        
        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          
          .step-number {
            font-weight: 600;
          }
          
          .step-actions {
            display: flex;
            gap: 0.5rem;
            
            button {
              background-color: transparent;
              border: none;
              color: var(--color-text-secondary);
              cursor: pointer;
              padding: 0.25rem;
              
              &:hover {
                color: var(--color-text-primary);
              }
              
              svg {
                width: 16px;
                height: 16px;
              }
            }
          }
        }
        
        .step-type-select {
          margin-bottom: 0.75rem;
        }
        
        .step-parameters {
          textarea {
            font-family: monospace;
            font-size: 0.9rem;
          }
        }
      }
    }
  }
`;

const ModalFooter = styled.div`
  padding: 1.25rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Automation = ({ workflows = [], setWorkflows, profiles = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const logViewerRef = useRef(null);
  
  // Form state for new/edit workflow
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    profileId: '',
    steps: [
      {
        type: 'navigate',
        parameters: { url: 'https://example.com' }
      }
    ]
  });

  useEffect(() => {
    // Subscribe to workflow log events
    window.api.on('workflow:log', (data) => {
      if (data.workflowId === selectedWorkflowId) {
        setLogs(prevLogs => [...prevLogs, data]);
        // Auto-scroll to bottom
        if (logViewerRef.current) {
          logViewerRef.current.scrollTop = logViewerRef.current.scrollHeight;
        }
      }
    });
    
    return () => {
      window.api.removeListener('workflow:log');
    };
  }, [selectedWorkflowId]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      profileId: '',
      steps: [
        {
          type: 'navigate',
          parameters: { url: 'https://example.com' }
        }
      ]
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (workflow) => {
    setCurrentWorkflow(workflow);
    // Deep copy the workflow to avoid mutating the original
    setFormData({
      name: workflow.name || '',
      description: workflow.description || '',
      profileId: workflow.profileId || '',
      steps: JSON.parse(JSON.stringify(workflow.steps || []))
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentWorkflow(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleStepTypeChange = (index, value) => {
    setFormData(prevData => {
      const newSteps = [...prevData.steps];
      
      // Set appropriate default parameters based on step type
      let defaultParams = {};
      switch (value) {
        case 'navigate':
          defaultParams = { url: 'https://example.com' };
          break;
        case 'click':
          defaultParams = { selector: '#button' };
          break;
        case 'type':
          defaultParams = { selector: '#input', text: 'Example text' };
          break;
        case 'screenshot':
          defaultParams = { filename: 'screenshot.png' };
          break;
        case 'wait':
          defaultParams = { milliseconds: 1000 };
          break;
        default:
          defaultParams = {};
      }
      
      newSteps[index] = {
        type: value,
        parameters: defaultParams
      };
      
      return { ...prevData, steps: newSteps };
    });
  };

  const handleStepParametersChange = (index, value) => {
    try {
      // Attempt to parse as JSON
      const parsedParams = JSON.parse(value);
      
      setFormData(prevData => {
        const newSteps = [...prevData.steps];
        newSteps[index] = {
          ...newSteps[index],
          parameters: parsedParams
        };
        return { ...prevData, steps: newSteps };
      });
    } catch (error) {
      // If not valid JSON, just store as is and we'll validate before submission
      setFormData(prevData => {
        const newSteps = [...prevData.steps];
        newSteps[index] = {
          ...newSteps[index],
          _parametersError: true,
          _parametersText: value
        };
        return { ...prevData, steps: newSteps };
      });
    }
  };

  const addStep = () => {
    setFormData(prevData => ({
      ...prevData,
      steps: [...prevData.steps, {
        type: 'navigate',
        parameters: { url: 'https://example.com' }
      }]
    }));
  };

  const removeStep = (index) => {
    setFormData(prevData => {
      const newSteps = [...prevData.steps];
      newSteps.splice(index, 1);
      return { ...prevData, steps: newSteps };
    });
  };

  const moveStepUp = (index) => {
    if (index === 0) return;
    
    setFormData(prevData => {
      const newSteps = [...prevData.steps];
      const temp = newSteps[index];
      newSteps[index] = newSteps[index - 1];
      newSteps[index - 1] = temp;
      return { ...prevData, steps: newSteps };
    });
  };

  const moveStepDown = (index) => {
    setFormData(prevData => {
      if (index === prevData.steps.length - 1) return prevData;
      
      const newSteps = [...prevData.steps];
      const temp = newSteps[index];
      newSteps[index] = newSteps[index + 1];
      newSteps[index + 1] = temp;
      return { ...prevData, steps: newSteps };
    });
  };

  const validateForm = () => {
    // Check if there are any parameter errors
    const parameterErrors = formData.steps.some(step => step._parametersError);
    if (parameterErrors) {
      alert('Some step parameters have invalid JSON. Please fix before submitting.');
      return false;
    }
    
    // Make sure all required fields are filled
    if (!formData.name) {
      alert('Workflow name is required.');
      return false;
    }
    
    if (!formData.profileId) {
      alert('Please select a profile to use for this workflow.');
      return false;
    }
    
    if (formData.steps.length === 0) {
      alert('At least one workflow step is required.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      // Clean up any temporary fields used for editing
      const cleanedSteps = formData.steps.map(step => ({
        type: step.type,
        parameters: step.parameters
      }));
      
      const submitData = {
        ...formData,
        steps: cleanedSteps
      };
      
      if (isEditing && currentWorkflow) {
        // Update existing workflow
        const updatedWorkflow = await window.api.updateWorkflow(currentWorkflow.id, submitData);
        setWorkflows(prevWorkflows => 
          prevWorkflows.map(workflow => 
            workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow
          )
        );
      } else {
        // Create new workflow
        const newWorkflow = await window.api.createWorkflow(submitData);
        setWorkflows(prevWorkflows => [...prevWorkflows, newWorkflow]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert(`Error saving workflow: ${error.message}`);
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await window.api.deleteWorkflow(workflowId);
        setWorkflows(prevWorkflows => prevWorkflows.filter(workflow => workflow.id !== workflowId));
        
        // If we're viewing logs for this workflow, clear them
        if (selectedWorkflowId === workflowId) {
          setSelectedWorkflowId(null);
          setLogs([]);
        }
      } catch (error) {
        console.error('Error deleting workflow:', error);
        alert(`Error deleting workflow: ${error.message}`);
      }
    }
  };

  const handleExecuteWorkflow = async (workflowId) => {
    try {
      setSelectedWorkflowId(workflowId);
      setLogs([]);
      await window.api.executeWorkflow(workflowId);
      // Workflow status and logs will be updated via IPC events
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert(`Error executing workflow: ${error.message}`);
    }
  };

  const handleStopWorkflow = async (workflowId) => {
    try {
      await window.api.stopWorkflow(workflowId);
      // Workflow status will be updated via IPC events
    } catch (error) {
      console.error('Error stopping workflow:', error);
      alert(`Error stopping workflow: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getStepTypeLabel = (type) => {
    switch (type) {
      case 'navigate': return 'Navigate to URL';
      case 'click': return 'Click Element';
      case 'type': return 'Type Text';
      case 'screenshot': return 'Take Screenshot';
      case 'wait': return 'Wait';
      case 'extract': return 'Extract Data';
      default: return type;
    }
  };

  return (
    <AutomationContainer>
      <PageHeader>
        <h1>Automation</h1>
        <ActionButton primary onClick={openCreateModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Create Workflow
        </ActionButton>
      </PageHeader>
      
      {workflows.length === 0 ? (
        <EmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <div className="empty-title">No automation workflows found</div>
          <div className="empty-description">
            Create your first workflow to automate repetitive browser tasks
          </div>
          <ActionButton primary onClick={openCreateModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Create First Workflow
          </ActionButton>
        </EmptyState>
      ) : (
        <>
          <WorkflowsGrid>
            {workflows.map(workflow => (
              <WorkflowCard key={workflow.id}>
                <WorkflowHeader status={workflow.status}>
                  <div className="workflow-title">
                    <div className="workflow-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    </div>
                    {workflow.name}
                  </div>
                  <div className="workflow-status">
                    <div className="status-indicator"></div>
                    {workflow.status === 'running' ? 'Running' :
                     workflow.status === 'error' ? 'Error' :
                     workflow.status === 'completed' ? 'Completed' : 'Idle'}
                  </div>
                </WorkflowHeader>
                
                <WorkflowBody>
                  <div className="workflow-details">
                    <div className="detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      <div className="detail-content">
                        <div className="detail-label">Profile</div>
                        <div className="detail-value">
                          {profiles.find(p => p.id === workflow.profileId)?.name || 'No profile selected'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <div className="detail-content">
                        <div className="detail-label">Last Run</div>
                        <div className="detail-value">
                          {workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : 'Never'}
                        </div>
                      </div>
                    </div>
                    
                    {workflow.description && (
                      <div className="detail-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <div className="detail-content">
                          <div className="detail-label">Description</div>
                          <div className="detail-value">{workflow.description}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="workflow-steps">
                    <div className="steps-header">Steps ({workflow.steps?.length || 0})</div>
                    <div className="step-list">
                      {workflow.steps?.slice(0, 3).map((step, index) => (
                        <div className="step-item" key={index}>
                          <div className="step-number">{index + 1}</div>
                          <div className="step-content">
                            {getStepTypeLabel(step.type)}
                            {step.type === 'navigate' && `: ${step.parameters.url}`}
                            {step.type === 'click' && `: ${step.parameters.selector}`}
                            {step.type === 'type' && `: ${step.parameters.selector}`}
                          </div>
                        </div>
                      ))}
                      {workflow.steps?.length > 3 && (
                        <div className="step-item">
                          <div className="step-number">...</div>
                          <div className="step-content">
                            + {workflow.steps.length - 3} more steps
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </WorkflowBody>
                
                <WorkflowFooter>
                  <div className="workflow-actions">
                    {workflow.status === 'running' ? (
                      <ActionButton onClick={() => handleStopWorkflow(workflow.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="6" width="12" height="12" />
                        </svg>
                        Stop
                      </ActionButton>
                    ) : (
                      <ActionButton primary onClick={() => handleExecuteWorkflow(workflow.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Run
                      </ActionButton>
                    )}
                    <ActionButton onClick={() => openEditModal(workflow)}>
                      Edit
                    </ActionButton>
                    <ActionButton onClick={() => handleDeleteWorkflow(workflow.id)}>
                      Delete
                    </ActionButton>
                  </div>
                  <div className="workflow-meta">
                    Steps: {workflow.steps?.length || 0}
                  </div>
                </WorkflowFooter>
              </WorkflowCard>
            ))}
          </WorkflowsGrid>
          
          {selectedWorkflowId && (
            <LogViewer>
              <div className="log-header">
                <h2>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Workflow Logs: {workflows.find(w => w.id === selectedWorkflowId)?.name}
                </h2>
                <div className="log-actions">
                  <ActionButton onClick={clearLogs}>
                    Clear Logs
                  </ActionButton>
                </div>
              </div>
              <div className="log-content" ref={logViewerRef}>
                {logs.length === 0 ? (
                  <div className="log-empty">No logs available. Run the workflow to see logs here.</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className={`log-entry ${log.level}`}>
                      <span className="log-timestamp">[{formatTimestamp(log.timestamp)}]</span>
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </LogViewer>
          )}
        </>
      )}
      
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>{isEditing ? 'Edit Workflow' : 'Create New Workflow'}</h2>
              <button onClick={closeModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </ModalHeader>
            
            <ModalBody>
              <div className="form-group">
                <label htmlFor="name">Workflow Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter workflow name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter workflow description (optional)"
                  rows="2"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="profileId">Profile</label>
                <select 
                  id="profileId" 
                  name="profileId"
                  value={formData.profileId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a profile</option>
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>{profile.name}</option>
                  ))}
                </select>
                <div className="helper-text">The browser profile that will be used to execute this workflow</div>
              </div>
              
              <div className="steps-container">
                <div className="steps-header">
                  <h3>Workflow Steps</h3>
                  <button onClick={addStep}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    Add Step
                  </button>
                </div>
                
                <div className="step-list">
                  {formData.steps.map((step, index) => (
                    <div className="step-item" key={index}>
                      <div className="step-header">
                        <div className="step-number">Step {index + 1}</div>
                        <div className="step-actions">
                          <button onClick={() => moveStepUp(index)} title="Move Up" disabled={index === 0}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                          </button>
                          <button onClick={() => moveStepDown(index)} title="Move Down" disabled={index === formData.steps.length - 1}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                          <button onClick={() => removeStep(index)} title="Remove Step">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="step-type-select">
                        <select
                          value={step.type}
                          onChange={(e) => handleStepTypeChange(index, e.target.value)}
                        >
                          <option value="navigate">Navigate to URL</option>
                          <option value="click">Click Element</option>
                          <option value="type">Type Text</option>
                          <option value="wait">Wait</option>
                          <option value="screenshot">Take Screenshot</option>
                          <option value="extract">Extract Data</option>
                        </select>
                      </div>
                      
                      <div className="step-parameters">
                        <textarea
                          value={step._parametersText || JSON.stringify(step.parameters, null, 2)}
                          onChange={(e) => handleStepParametersChange(index, e.target.value)}
                          rows="4"
                          placeholder="Enter parameters as JSON"
                        />
                        {step._parametersError && (
                          <div className="helper-text" style={{ color: '#f87171' }}>
                            Invalid JSON format. Please correct before saving.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <ActionButton onClick={closeModal}>Cancel</ActionButton>
              <ActionButton primary onClick={handleSubmit}>
                {isEditing ? 'Update Workflow' : 'Create Workflow'}
              </ActionButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </AutomationContainer>
  );
};

export default Automation;
