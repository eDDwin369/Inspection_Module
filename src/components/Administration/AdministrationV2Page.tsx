import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Radio as SignalIcon, 
  RotateCcw, 
  Pencil, 
  CheckCircle2, 
  Trash2, 
  Users, 
  HardDrive, 
  Ticket, 
  Shield,
  LayoutList,
  TrendingUp,
  Filter,
  Eye,
  EyeOff,
  ImageOff,
  Ruler
} from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { Modal } from '../shared/Modal';
import { TextField } from '../shared/TextField';
import { CreateTicketModal } from './CreateTicketModal';
import { ManageTicketsModal } from './ManageTicketsModal';
import { 
  TrendsPopoverCard, 
  TicketSizePopoverCard, 
  TicketFilterPopoverCard 
} from './TicketOptionsPopovers';
import './AdministrationPage.css';
import './AdministrationV2Page.css';

export interface TicketingIntegration {
  id: string;
  name: string;
  subtitle: string;
  isDefault: boolean;
  isBuiltIn: boolean;
  status: 'connected' | 'disconnected';
  daysOnLiveView: number;
  daysDataStore: number;
  snapshotConfig: 'always' | 'creator_chooses' | 'disabled';
  lastSync: string;
}

const INITIAL_INTEGRATIONS: TicketingIntegration[] = [
  {
    id: 'jira',
    name: 'Jira',
    subtitle: 'Jira',
    isDefault: true,
    isBuiltIn: true,
    status: 'connected',
    daysOnLiveView: 30,
    daysDataStore: 90,
    snapshotConfig: 'always',
    lastSync: 'Last sync 2 h ago · Nov 19, 06:36 PM'
  }
];

const V2_USERS = [
  {
    id: 'ava',
    name: 'Ava Sharma',
    email: 'ava.sharma@oomnieye.io',
    roleTag: 'admin',
    roleLabel: 'Administrator',
    avatarInitials: 'AS',
    avatarBg: '#007bff'
  },
  {
    id: 'michael',
    name: 'Michael Reed',
    email: 'michael.reed@oomnieye.io',
    roleTag: 'operator',
    roleLabel: 'Operator',
    avatarInitials: 'MR',
    avatarBg: '#10b981'
  },
  {
    id: 'sarah',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@oomnieye.io',
    roleTag: 'viewer',
    roleLabel: 'Viewer',
    avatarInitials: 'SW',
    avatarBg: '#f59e0b'
  }
];

const V2_DEVICE_SITES = [
  {
    id: 'construction',
    name: 'Construction Site',
    status: 'online',
    description: 'Tower block build — crane-mounted 360° overview of the whole site',
    devices: [
      { name: 'Construction Site 360', type: '360° camera', ip: '10.40.1.11' },
      { name: 'Site PTZ', type: 'PTZ camera', ip: '10.40.1.12' },
      { name: 'CCTV-4', type: 'CCTV camera', ip: '10.40.1.21' },
      { name: 'Material Storage CCTV', type: 'CCTV camera', ip: '10.40.1.22' }
    ]
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    status: 'online',
    description: 'Automated assembly plant — production line, warehouse and dispatch dock',
    devices: [
      { name: 'Warehouse 360', type: '360° camera', ip: '10.40.2.11' },
      { name: 'Warehouse PTZ', type: 'PTZ camera', ip: '10.40.2.12' },
      { name: 'Production Floor CCTV', type: 'CCTV camera', ip: '10.40.2.21' },
      { name: 'Warehouse CCTV', type: 'CCTV camera', ip: '10.40.2.22' },
      { name: 'Entrance CCTV', type: 'CCTV camera', ip: '10.40.2.23' },
      { name: 'Loading Area CCTV', type: 'CCTV camera', ip: '10.40.2.24' }
    ]
  }
];

export function AdministrationV2Page() {
  const [activeTab, setActiveTab] = useState<'users' | 'devices' | 'tickets'>('tickets');
  const [integrations, setIntegrations] = useState<TicketingIntegration[]>(INITIAL_INTEGRATIONS);
  
  // Feedback toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncingId, setIsSyncingId] = useState<string | null>(null);

  // Add Integration Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [isManageTicketsModalOpen, setIsManageTicketsModalOpen] = useState(false);

  // Ticket Options Dropdown State (Images 2 & 3 Reference)
  const [isTicketMenuOpen, setIsTicketMenuOpen] = useState(false);
  const [isTicketViewDisabled, setIsTicketViewDisabled] = useState(false);
  const [isTicketPreviewDisabled, setIsTicketPreviewDisabled] = useState(false);
  const [ticketSize, setTicketSize] = useState(28);
  const ticketMenuRef = useRef<HTMLDivElement>(null);

  // Popovers State (Trends, Size, Filter - Images 1, 2, 3 Reference)
  const [isTrendsOpen, setIsTrendsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTicketSizeOpen, setIsTicketSizeOpen] = useState(false);
  const [ticketFilters, setTicketFilters] = useState({
    fromDate: '',
    toDate: '',
    status: 'Any',
    camera: 'Any',
    creator: 'Any',
    assignee: 'Any'
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ticketMenuRef.current && !ticketMenuRef.current.contains(e.target as Node)) {
        setIsTicketMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsTicketMenuOpen(false);
    };

    if (isTicketMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTicketMenuOpen]);
  const [newProvider, setNewProvider] = useState<'ServiceNow' | 'Zendesk' | 'Freshdesk' | 'Custom Webhook'>('ServiceNow');
  const [newProviderName, setNewProviderName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [newDaysLive, setNewDaysLive] = useState('30');
  const [newDaysStore, setNewDaysStore] = useState('90');
  const [newSnapshotConfig, setNewSnapshotConfig] = useState<'always' | 'creator_chooses' | 'disabled'>('creator_chooses');

  // Edit Integration Modal State
  const [editingIntegration, setEditingIntegration] = useState<TicketingIntegration | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDaysChange = (id: string, field: 'daysOnLiveView' | 'daysDataStore', value: string) => {
    const num = parseInt(value, 10);
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: isNaN(num) ? 0 : num };
      }
      return item;
    }));
  };

  const handleSnapshotConfigChange = (id: string, config: 'always' | 'creator_chooses' | 'disabled') => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, snapshotConfig: config };
      }
      return item;
    }));
    showToast(`Snapshot configuration updated to: ${config === 'always' ? 'Always Capture' : config === 'creator_chooses' ? 'Ticket Creator Chooses' : 'Disabled'}`);
  };

  const handleSyncNow = (id: string) => {
    setIsSyncingId(id);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, lastSync: `Last sync just now · ${timeStr}` };
        }
        return item;
      }));
      setIsSyncingId(null);
      showToast('Successfully synchronized tickets and provider configuration!');
    }, 900);
  };

  const handleTestConnection = (name: string) => {
    showToast(`Testing ${name} connection... Success! HTTP 200 (Active endpoint responded)`);
  };

  const handleSaveNewIntegration = () => {
    if (!newProviderName.trim()) {
      alert('Please enter an integration name');
      return;
    }
    const newIntegration: TicketingIntegration = {
      id: `integration-${Date.now()}`,
      name: newProviderName.trim(),
      subtitle: newProvider,
      isDefault: false,
      isBuiltIn: false,
      status: 'connected',
      daysOnLiveView: parseInt(newDaysLive, 10) || 30,
      daysDataStore: parseInt(newDaysStore, 10) || 90,
      snapshotConfig: newSnapshotConfig,
      lastSync: 'Last sync just now · Nov 19, 06:40 PM'
    };
    setIntegrations(prev => [...prev, newIntegration]);
    setIsAddModalOpen(false);
    setNewProviderName('');
    setNewServerUrl('');
    setNewApiKey('');
    showToast(`Successfully added ${newIntegration.name} ticketing provider!`);
  };

  const handleSaveEditedIntegration = () => {
    if (!editingIntegration) return;
    setIntegrations(prev => prev.map(item => {
      if (item.id === editingIntegration.id) {
        return editingIntegration;
      }
      return item;
    }));
    setEditingIntegration(null);
    showToast('Integration configuration saved successfully');
  };

  const currentTabConfig = {
    users: { label: 'User Management', icon: <Users size={16} /> },
    devices: { label: 'Device Management', icon: <HardDrive size={16} /> },
    tickets: { label: 'Ticket Management', icon: <Ticket size={16} /> }
  }[activeTab];

  return (
    <div className="admin-v2-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            top: '24px',
            right: '28px',
            zIndex: 10000,
            background: 'var(--text-main, #0f172a)',
            color: 'var(--bg-card, #ffffff)',
            padding: '12px 18px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 500,
            animation: 'adminFadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={17} style={{ color: '#10b981', flexShrink: 0 }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header conforming to Base Application Design Standards */}
      <PageHeader 
        title="Inspection Module" 
        icon={<Shield size={20} />}
        subItem={{
          label: currentTabConfig.label,
          icon: currentTabConfig.icon
        }}
      />

      {/* Sub-tabs Navigation Bar (Matching AI Management) */}
      <div className="admin-subtabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'users'}
          className={`admin-subtab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="admin-subtab-icon-badge">
            <Users size={16} />
          </span>
          <span>User Management</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'devices'}
          className={`admin-subtab-btn ${activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          <span className="admin-subtab-icon-badge">
            <HardDrive size={16} />
          </span>
          <span>Device Management</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tickets'}
          className={`admin-subtab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <span className="admin-subtab-icon-badge">
            <Ticket size={16} />
          </span>
          <span>Ticket Management</span>
        </button>
      </div>

      {/* Cardless Content Area - Blends seamlessly into the background */}
      <div className="admin-v2-content">
        {/* Tab 1: Ticket Management (Matches Reference Screenshot) */}
        {activeTab === 'tickets' && (
          <>
            {/* Section Header */}
            <div className="admin-v2-section-header">
              <div className="admin-v2-section-info">
                <h2 className="admin-v2-section-title">Third-party ticketing</h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  type="button" 
                  className="admin-primary-btn"
                  onClick={() => setIsCreateTicketModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Ticket size={16} />
                  <span>Create Ticket</span>
                </button>

                {/* Ticket Options Button & Dropdown Menu (Images 2 & 3 Reference) */}
                <div className="admin-v2-ticket-menu-wrapper" ref={ticketMenuRef}>
                  <button
                    type="button"
                    className={`admin-v2-ticket-options-btn ${isTicketMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsTicketMenuOpen(prev => !prev)}
                    title="Ticket Views & Settings"
                    aria-label="Ticket Views & Settings"
                    aria-expanded={isTicketMenuOpen}
                  >
                    <Ticket size={18} />
                  </button>

                  {isTicketMenuOpen && (
                    <div className="admin-v2-ticket-menu-card" role="menu">
                      <button 
                        type="button"
                        role="menuitem"
                        className="admin-v2-ticket-menu-item"
                        onClick={() => {
                          setIsTicketMenuOpen(false);
                          setIsManageTicketsModalOpen(true);
                        }}
                      >
                        <span className="admin-v2-ticket-menu-icon">
                          <LayoutList size={17} />
                        </span>
                        <span>Manage Tickets</span>
                      </button>

                      <button 
                        type="button"
                        role="menuitem"
                        className="admin-v2-ticket-menu-item"
                        onClick={() => {
                          setIsTicketMenuOpen(false);
                          setIsTrendsOpen(true);
                        }}
                      >
                        <span className="admin-v2-ticket-menu-icon">
                          <TrendingUp size={17} />
                        </span>
                        <span>Trends</span>
                      </button>

                      <button 
                        type="button"
                        role="menuitem"
                        className="admin-v2-ticket-menu-item"
                        onClick={() => {
                          setIsTicketMenuOpen(false);
                          setIsFilterOpen(true);
                        }}
                      >
                        <span className="admin-v2-ticket-menu-icon">
                          <Filter size={17} />
                        </span>
                        <span>Filter</span>
                      </button>

                      <button 
                        type="button"
                        role="menuitem"
                        className="admin-v2-ticket-menu-item"
                        onClick={() => {
                          setIsTicketViewDisabled(prev => !prev);
                          showToast(!isTicketViewDisabled ? 'Ticket view disabled on map and live streams.' : 'Ticket view enabled on map and live streams.');
                        }}
                      >
                        <span className="admin-v2-ticket-menu-icon">
                          {isTicketViewDisabled ? <Eye size={17} /> : <EyeOff size={17} />}
                        </span>
                        <span>{isTicketViewDisabled ? 'Enable ticket view' : 'Disable ticket view'}</span>
                      </button>

                      <button 
                        type="button"
                        role="menuitem"
                        className="admin-v2-ticket-menu-item"
                        onClick={() => {
                          setIsTicketPreviewDisabled(prev => !prev);
                          showToast(!isTicketPreviewDisabled ? 'Ticket preview hover card disabled.' : 'Ticket preview hover card enabled.');
                        }}
                      >
                        <span className="admin-v2-ticket-menu-icon">
                          <ImageOff size={17} />
                        </span>
                        <span>{isTicketPreviewDisabled ? 'Enable ticket preview' : 'Disable ticket preview'}</span>
                      </button>

                      <button 
                        type="button"
                        role="menuitem"
                        className="admin-v2-ticket-menu-item"
                        onClick={() => {
                          setIsTicketMenuOpen(false);
                          setIsTicketSizeOpen(true);
                        }}
                      >
                        <span className="admin-v2-ticket-menu-icon">
                          <Ruler size={17} />
                        </span>
                        <span>Ticket size · {ticketSize}px</span>
                      </button>
                    </div>
                  )}

                  {/* Trends Popover Card (Image 1 Reference) */}
                  <TrendsPopoverCard 
                    isOpen={isTrendsOpen}
                    onClose={() => setIsTrendsOpen(false)}
                    ticketCounts={{ total: 0, todo: 0, closed: 0, accepted: 0, failed: 0 }}
                  />

                  {/* Ticket Size Popover Card (Image 2 Reference) */}
                  <TicketSizePopoverCard 
                    isOpen={isTicketSizeOpen}
                    onClose={() => setIsTicketSizeOpen(false)}
                    size={ticketSize}
                    onChange={(val) => {
                      setTicketSize(val);
                      showToast(`Ticket marker size set to ${val}px.`);
                    }}
                  />

                  {/* Filter Popover Card (Image 3 Reference) */}
                  <TicketFilterPopoverCard 
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    filters={ticketFilters}
                    onChange={setTicketFilters}
                    onClear={() => {
                      setTicketFilters({
                        fromDate: '',
                        toDate: '',
                        status: 'Any',
                        camera: 'Any',
                        creator: 'Any',
                        assignee: 'Any'
                      });
                      showToast('Filters cleared.');
                    }}
                  />
                </div>

                <button 
                  type="button" 
                  className="admin-add-pill-btn"
                  onClick={() => setIsAddModalOpen(true)}
                  title="Add Integration"
                  aria-label="Add Integration"
                >
                  <Plus size={20} strokeWidth={2.6} />
                </button>
              </div>
            </div>

            {/* Integrations Grid */}
            <div className="admin-v2-integrations-grid">
              {integrations.map((item) => (
                <div 
                  key={item.id} 
                  className={`admin-v2-integration-card ${item.isDefault ? '' : 'non-default'}`}
                >
                  {/* Card Header */}
                  <div className="admin-v2-card-top">
                    <div className="admin-v2-card-identity">
                      <div className="admin-v2-card-title-row">
                        <h3 className="admin-v2-card-title">{item.name}</h3>
                        {item.isDefault && <span className="admin-v2-badge-default">Default</span>}
                        {item.isBuiltIn && <span className="admin-v2-badge-builtin">Built-in</span>}
                      </div>
                    </div>

                    <span className={`admin-v2-badge-status ${item.status === 'connected' ? '' : 'disconnected'}`}>
                      <span className="admin-v2-status-dot" />
                      {item.status === 'connected' ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  {/* 2-Column Fields (Days on Live View & Days of data to store) */}
                  <div className="admin-v2-fields-row">
                    <div className="admin-v2-stat-box">
                      <span className="admin-v2-stat-label">Days on Live View</span>
                      <input 
                        type="number"
                        className="admin-v2-stat-input"
                        value={item.daysOnLiveView}
                        onChange={(e) => handleDaysChange(item.id, 'daysOnLiveView', e.target.value)}
                        min={1}
                        max={365}
                      />
                    </div>

                    <div className="admin-v2-stat-box">
                      <span className="admin-v2-stat-label">Days of data to store</span>
                      <input 
                        type="number"
                        className="admin-v2-stat-input"
                        value={item.daysDataStore}
                        onChange={(e) => handleDaysChange(item.id, 'daysDataStore', e.target.value)}
                        min={1}
                        max={730}
                      />
                    </div>
                  </div>

                  {/* Snapshot Configuration: Text Left, Radio Right */}
                  <div className="admin-v2-snapshot-section">
                    <span className="admin-v2-snapshot-heading">Snapshot Configuration</span>

                    <div className="admin-v2-radio-group">
                      <label 
                        className={`admin-v2-radio-label ${item.snapshotConfig === 'always' ? 'checked' : ''}`}
                        onClick={() => handleSnapshotConfigChange(item.id, 'always')}
                      >
                        <span>Always Capture Snapshot</span>
                        <span className="admin-v2-custom-radio">
                          <span className="admin-v2-radio-dot" />
                        </span>
                      </label>

                      <label 
                        className={`admin-v2-radio-label ${item.snapshotConfig === 'creator_chooses' ? 'checked' : ''}`}
                        onClick={() => handleSnapshotConfigChange(item.id, 'creator_chooses')}
                      >
                        <span>Ticket Creator Chooses</span>
                        <span className="admin-v2-custom-radio">
                          <span className="admin-v2-radio-dot" />
                        </span>
                      </label>

                      <label 
                        className={`admin-v2-radio-label ${item.snapshotConfig === 'disabled' ? 'checked' : ''}`}
                        onClick={() => handleSnapshotConfigChange(item.id, 'disabled')}
                      >
                        <span>Disable Snapshot Feature</span>
                        <span className="admin-v2-custom-radio">
                          <span className="admin-v2-radio-dot" />
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Bottom Metadata & Big Button Action Icons */}
                  <div className="admin-v2-card-bottom">
                    <div className="admin-v2-sync-timestamp-wrap">
                      <span className="admin-v2-sync-timestamp">{item.lastSync}</span>
                    </div>

                    <div className="admin-v2-card-divider" />

                    <div className="admin-v2-card-actions">
                      {/* Webhook Stream Status */}
                      <button 
                        type="button" 
                        className="admin-v2-icon-btn"
                        title="Webhook and Event Stream Active"
                        onClick={() => showToast(`${item.name} webhook stream is healthy and listening on port 443.`)}
                      >
                        <SignalIcon size={20} />
                      </button>

                      {/* Sync Button */}
                      <button 
                        type="button" 
                        className="admin-v2-icon-btn"
                        title="Sync integration now"
                        onClick={() => handleSyncNow(item.id)}
                      >
                        <RotateCcw 
                          size={20} 
                          style={{
                            transform: isSyncingId === item.id ? 'rotate(360deg)' : 'none',
                            transition: isSyncingId === item.id ? 'transform 0.8s linear' : 'none'
                          }} 
                        />
                      </button>

                      {/* Edit Button */}
                      <button 
                        type="button" 
                        className="admin-v2-icon-btn"
                        title="Edit integration settings"
                        onClick={() => setEditingIntegration(item)}
                      >
                        <Pencil size={20} />
                      </button>

                      {/* Test Connection Button */}
                      <button 
                        type="button" 
                        className="admin-v2-icon-btn"
                        title="Test provider connection"
                        onClick={() => handleTestConnection(item.name)}
                      >
                        <CheckCircle2 size={20} />
                      </button>

                      {/* Delete Button (Disabled for built-in, active for custom) */}
                      <button 
                        type="button" 
                        className="admin-v2-icon-btn"
                        disabled={item.isBuiltIn}
                        title={item.isBuiltIn ? "Built-in integration cannot be deleted" : "Delete integration"}
                        onClick={() => {
                          if (!item.isBuiltIn && window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                            setIntegrations(prev => prev.filter(i => i.id !== item.id));
                            showToast(`Deleted ${item.name} integration.`);
                          }
                        }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}

        {/* Tab 2: User Management (Matching Reference Image 1) */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-v2-users-list">
              {V2_USERS.map((user) => (
                <div key={user.id} className="admin-v2-user-card">
                  <div className="admin-v2-user-left">
                    <div 
                      className="admin-v2-user-avatar" 
                      style={{ backgroundColor: user.avatarBg }}
                    >
                      {user.avatarInitials}
                    </div>
                    <div className="admin-v2-user-info">
                      <h3 className="admin-v2-user-name">{user.name}</h3>
                      <p className="admin-v2-user-meta">
                        {user.email} · {user.roleTag}
                      </p>
                    </div>
                  </div>

                  <span className="admin-v2-role-badge">
                    {user.roleLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Device Management (Matching Reference Image 2) */}
        {activeTab === 'devices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-v2-devices-list">
              {V2_DEVICE_SITES.map((site) => (
                <div key={site.id} className="admin-v2-device-card">
                  <div className="admin-v2-device-header">
                    <h3 className="admin-v2-device-site-title">{site.name}</h3>
                    <span className="admin-v2-online-pill">{site.status}</span>
                  </div>

                  <p className="admin-v2-device-site-desc">{site.description}</p>

                  <div className="admin-v2-device-items">
                    {site.devices.map((device, idx) => (
                      <div key={idx} className="admin-v2-device-item-row">
                        <span>{device.name}</span>
                        <span className="admin-v2-sep">·</span>
                        <span>{device.type}</span>
                        <span className="admin-v2-sep">·</span>
                        <span className="admin-v2-device-ip">{device.ip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD INTEGRATION MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Ticketing Integration"
        maxWidth="540px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '16px 0 8px 0' }}>
          <TextField
            as="select"
            label="Integration Provider"
            value={newProvider}
            onChange={(e) => {
              const val = e.target.value as any;
              setNewProvider(val);
              if (!newProviderName) setNewProviderName(val);
            }}
            options={[
              { value: 'ServiceNow', label: 'ServiceNow' },
              { value: 'Zendesk', label: 'Zendesk Support' },
              { value: 'Freshdesk', label: 'Freshdesk' },
              { value: 'Custom Webhook', label: 'Custom HTTP Webhook' }
            ]}
          />

          <TextField
            label="Integration Name *"
            value={newProviderName}
            onChange={(e) => setNewProviderName(e.target.value)}
            placeholder="e.g. Corporate ServiceNow, Regional Zendesk"
          />

          <TextField
            label="Instance URL (Host / API Endpoint) *"
            value={newServerUrl}
            onChange={(e) => setNewServerUrl(e.target.value)}
            placeholder="https://company.service-now.com"
          />

          <TextField
            type="password"
            label="API Token / Secret Key *"
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
            placeholder="••••••••••••••••••••"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <TextField
              type="number"
              label="Days on Live View"
              value={newDaysLive}
              onChange={(e) => setNewDaysLive(e.target.value)}
            />
            <TextField
              type="number"
              label="Days of Data to Store"
              value={newDaysStore}
              onChange={(e) => setNewDaysStore(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className="figma-btn-cancel"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleSaveNewIntegration}
            >
              Add Integration
            </button>
          </div>
        </div>
      </Modal>

      {/* EDIT INTEGRATION MODAL */}
      {editingIntegration && (
        <Modal
          isOpen={Boolean(editingIntegration)}
          onClose={() => setEditingIntegration(null)}
          title={`Edit Integration: ${editingIntegration.name}`}
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '16px 0 8px 0' }}>
            <TextField
              label="Integration Name"
              value={editingIntegration.name}
              disabled={editingIntegration.isBuiltIn}
              onChange={(e) => setEditingIntegration({ ...editingIntegration, name: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <TextField
                type="number"
                label="Days on Live View"
                value={editingIntegration.daysOnLiveView}
                onChange={(e) => setEditingIntegration({ ...editingIntegration, daysOnLiveView: parseInt(e.target.value, 10) || 0 })}
              />
              <TextField
                type="number"
                label="Days of Data to Store"
                value={editingIntegration.daysDataStore}
                onChange={(e) => setEditingIntegration({ ...editingIntegration, daysDataStore: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="figma-btn-cancel"
                onClick={() => setEditingIntegration(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-primary-btn"
                onClick={handleSaveEditedIntegration}
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE TICKET MODAL */}
      <CreateTicketModal 
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        showToast={showToast}
      />

      {/* MANAGE TICKETS MODAL (Image Reference) */}
      <ManageTicketsModal
        isOpen={isManageTicketsModalOpen}
        onClose={() => setIsManageTicketsModalOpen(false)}
        showToast={showToast}
        onOpenCreateTicket={() => {
          setIsManageTicketsModalOpen(false);
          setIsCreateTicketModalOpen(true);
        }}
      />
    </div>
  );
}
