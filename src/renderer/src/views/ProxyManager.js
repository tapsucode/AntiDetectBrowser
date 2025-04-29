import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ProxyManagerContainer = styled.div`
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
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .search-input {
    flex: 1;
    position: relative;
    
    input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
      font-size: 0.95rem;
      
      &::placeholder {
        color: var(--color-text-secondary);
      }
      
      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }
    }
    
    svg {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-secondary);
      width: 18px;
      height: 18px;
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ProxiesTable = styled.div`
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-border);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 120px;
  padding: 1rem 1.5rem;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr auto;
    
    .hide-mobile {
      display: none;
    }
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 120px;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--color-border);
  }
  
  .proxy-name {
    font-weight: 500;
  }
  
  .proxy-host {
    color: var(--color-text-secondary);
    font-family: monospace;
    font-size: 0.9rem;
  }
  
  .proxy-type {
    text-transform: uppercase;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
  
  .proxy-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: ${props => props.status === 'working' ? '#4ade80' : 
                                  props.status === 'error' ? '#f87171' : 
                                  '#94a3b8'};
    }
    
    .status-text {
      font-size: 0.9rem;
      color: ${props => props.status === 'working' ? '#4ade80' : 
                         props.status === 'error' ? '#f87171' : 
                         'var(--color-text-secondary)'};
    }
  }
  
  .proxy-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr auto;
    
    .hide-mobile {
      display: none;
    }
  }
`;

const IconButton = styled.button`
  background-color: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--color-border);
    color: var(--color-accent);
  }
  
  svg {
    width: 16px;
    height: 16px;
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

const NetworkVisualization = styled.div`
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 1px solid var(--color-border);
  
  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .visualization-container {
    width: 100%;
    height: 200px;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.7;
    }
    
    .visualization-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, 
                  transparent 0%, 
                  var(--color-bg-secondary) 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1.5rem;
      
      .stats {
        display: flex;
        gap: 2rem;
        
        .stat {
          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-accent);
          }
          
          .stat-label {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
          }
        }
      }
    }
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
  max-width: 500px;
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
  
  .form-group {
    margin-bottom: 1.25rem;
    
    label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    input, select {
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
    
    .helper-text {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
  }
`;

const ModalFooter = styled.div`
  padding: 1.25rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => 
    props.type === 'http' ? 'rgba(99, 102, 241, 0.1)' : 
    props.type === 'socks' ? 'rgba(74, 222, 128, 0.1)' :
    props.type === 'ssl' ? 'rgba(251, 191, 36, 0.1)' :
    'rgba(148, 163, 184, 0.1)'
  };
  color: ${props => 
    props.type === 'http' ? '#6366f1' : 
    props.type === 'socks' ? '#4ade80' :
    props.type === 'ssl' ? '#fbbc24' :
    '#94a3b8'
  };
`;

const ProxyManager = ({ proxies = [], setProxies }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProxy, setCurrentProxy] = useState(null);
  
  // Form state for new/edit proxy
  const [formData, setFormData] = useState({
    name: '',
    type: 'http',
    host: '',
    port: '',
    username: '',
    password: '',
    country: '',
    city: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'http',
      host: '',
      port: '',
      username: '',
      password: '',
      country: '',
      city: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (proxy) => {
    setCurrentProxy(proxy);
    setFormData({
      name: proxy.name || '',
      type: proxy.type || 'http',
      host: proxy.host || '',
      port: proxy.port || '',
      username: proxy.username || '',
      password: proxy.password || '',
      country: proxy.country || '',
      city: proxy.city || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentProxy(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && currentProxy) {
        // Update existing proxy
        const updatedProxy = await window.api.updateProxy(currentProxy.id, formData);
        setProxies(prevProxies => 
          prevProxies.map(proxy => 
            proxy.id === updatedProxy.id ? updatedProxy : proxy
          )
        );
      } else {
        // Create new proxy
        const newProxy = await window.api.addProxy(formData);
        setProxies(prevProxies => [...prevProxies, newProxy]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving proxy:', error);
      // Handle error (show error message)
    }
  };

  const handleDeleteProxy = async (proxyId) => {
    if (window.confirm('Are you sure you want to delete this proxy?')) {
      try {
        await window.api.deleteProxy(proxyId);
        setProxies(prevProxies => prevProxies.filter(proxy => proxy.id !== proxyId));
      } catch (error) {
        console.error('Error deleting proxy:', error);
        // Handle error (show error message)
      }
    }
  };

  const handleTestProxy = async (proxyId) => {
    try {
      await window.api.testProxy(proxyId);
      // Status update will come through IPC event
    } catch (error) {
      console.error('Error testing proxy:', error);
    }
  };

  // Filter proxies based on search term
  const filteredProxies = proxies.filter(proxy => 
    proxy.name && proxy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proxy.host && proxy.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proxy.country && proxy.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats for visualization
  const workingProxies = proxies.filter(p => p.status === 'working').length;
  const totalProxies = proxies.length;
  const workingPercentage = totalProxies > 0 ? Math.round((workingProxies / totalProxies) * 100) : 0;

  return (
    <ProxyManagerContainer>
      <PageHeader>
        <h1>Proxy Manager</h1>
        <ActionButton primary onClick={openCreateModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Add Proxy
        </ActionButton>
      </PageHeader>
      
      <SearchBar>
        <div className="search-input">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search proxies by name, host, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <FilterButton>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filter
        </FilterButton>
      </SearchBar>
      
      {filteredProxies.length === 0 ? (
        <EmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
          <div className="empty-title">No proxies found</div>
          <div className="empty-description">
            {searchTerm 
              ? `No proxies match the search term "${searchTerm}"`
              : "Add your first proxy to start browsing securely through different locations"}
          </div>
          <ActionButton primary onClick={openCreateModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add First Proxy
          </ActionButton>
        </EmptyState>
      ) : (
        <>
          <ProxiesTable>
            <TableHeader>
              <div>Name</div>
              <div>Host / Port</div>
              <div>Type</div>
              <div>Status</div>
              <div>Actions</div>
            </TableHeader>
            
            {filteredProxies.map(proxy => (
              <TableRow key={proxy.id} status={proxy.status}>
                <div className="proxy-name">{proxy.name}</div>
                <div className="proxy-host">{proxy.host}:{proxy.port}</div>
                <div>
                  <Badge type={proxy.type}>{proxy.type}</Badge>
                </div>
                <div className="proxy-status">
                  <div className="status-indicator"></div>
                  <div className="status-text">
                    {proxy.status === 'working' ? 'Working' : 
                     proxy.status === 'error' ? 'Error' : 'Not Tested'}
                  </div>
                </div>
                <div className="proxy-actions">
                  <IconButton onClick={() => handleTestProxy(proxy.id)} title="Test Proxy">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </IconButton>
                  <IconButton onClick={() => openEditModal(proxy)} title="Edit Proxy">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProxy(proxy.id)} title="Delete Proxy">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </IconButton>
                </div>
              </TableRow>
            ))}
          </ProxiesTable>
          
          <NetworkVisualization>
            <h2>Proxy Network Overview</h2>
            <div className="visualization-container">
              <img src="https://images.unsplash.com/photo-1545987796-200677ee1011" alt="Network Visualization" />
              <div className="visualization-overlay">
                <div className="stats">
                  <div className="stat">
                    <div className="stat-value">{workingProxies}</div>
                    <div className="stat-label">Working Proxies</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{totalProxies}</div>
                    <div className="stat-label">Total Proxies</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{workingPercentage}%</div>
                    <div className="stat-label">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </NetworkVisualization>
        </>
      )}
      
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>{isEditing ? 'Edit Proxy' : 'Add New Proxy'}</h2>
              <button onClick={closeModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </ModalHeader>
            
            <ModalBody>
              <div className="form-group">
                <label htmlFor="name">Proxy Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive name for this proxy"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Proxy Type</label>
                <select 
                  id="type" 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                  <option value="socks4">SOCKS4</option>
                  <option value="socks5">SOCKS5</option>
                  <option value="ssl">SSL/TLS</option>
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="host">Host / IP Address</label>
                  <input 
                    type="text" 
                    id="host" 
                    name="host"
                    value={formData.host}
                    onChange={handleInputChange}
                    placeholder="proxy.example.com or 192.168.1.1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="port">Port</label>
                  <input 
                    type="text" 
                    id="port" 
                    name="port"
                    value={formData.port}
                    onChange={handleInputChange}
                    placeholder="8080"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input 
                    type="text" 
                    id="username" 
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username (if required)"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password (if required)"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input 
                    type="text" 
                    id="country" 
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country (optional)"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input 
                    type="text" 
                    id="city" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City (optional)"
                  />
                </div>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <ActionButton onClick={closeModal}>Cancel</ActionButton>
              <ActionButton primary onClick={handleSubmit}>
                {isEditing ? 'Update Proxy' : 'Add Proxy'}
              </ActionButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </ProxyManagerContainer>
  );
};

export default ProxyManager;
