import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  FileText, 
  SlidersHorizontal, 
  History, 
  Camera, 
  Settings, 
  Mic, 
  Paperclip, 
  MapPin, 
  Crop, 
  Pencil, 
  Maximize2, 
  ChevronDown, 
  CheckCircle2,
  Clock,
  Calendar,
  Link2,
  Plus,
  Sparkles,
  Tag,
  Building,
  UserCheck,
  MessageSquare,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Modal } from '../shared/Modal';
import { TextField } from '../shared/TextField';
import './AdministrationPage.css';
import './CreateTicketModal.css';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticket: any) => void;
  showToast: (msg: string) => void;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  onTicketCreated,
  showToast
}: CreateTicketModalProps) {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'general' | 'additional' | 'activity'>('general');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ticketType, setTicketType] = useState('Standard');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [assignee, setAssignee] = useState('Michael Reed');
  
  // Additional tab state
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [isDateTimeFocused, setIsDateTimeFocused] = useState(false);
  const [onBreachAction, setOnBreachAction] = useState('Select action');
  const [linkedTickets, setLinkedTickets] = useState<string[]>([]);

  // Activity tab state
  const [activityNote, setActivityNote] = useState('');
  const [isNoteFocused, setIsNoteFocused] = useState(false);

  // Camera & Voice Simulation States
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [liveTimestamp, setLiveTimestamp] = useState('19-11-2026 22:11:07 Thu');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Update timestamp every second when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const updateTime = () => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const timeStr = now.toTimeString().split(' ')[0];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const day = days[now.getDay()];
      setLiveTimestamp(`${dd}-${mm}-${yyyy} ${timeStr} ${day}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Voice title input simulation
  const handleMicToggle = () => {
    if (!isListening) {
      setIsListening(true);
      showToast('Voice transcription listening... Speak clearly into your mic.');
      setTimeout(() => {
        setTitle('Unauthorized vehicle parked near Crane North excavator');
        setIsListening(false);
        showToast('Voice transcribed: "Unauthorized vehicle parked near Crane North excavator"');
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  // Attachment handler
  const handleAttachment = () => {
    showToast('File attachment dialog opened. Snapshot automatically linked.');
  };

  // Create Ticket Submit Handler
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a ticket title before submitting.');
      return;
    }

    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      description,
      ticketType,
      priority,
      assignee,
      cameraSource: 'Construction Site 360',
      timestamp: liveTimestamp,
      status: 'Open'
    };

    onTicketCreated?.(newTicket);
    showToast(`Ticket #${newTicket.id} created successfully and synchronized with Jira!`);
    
    // Reset and close
    setTitle('');
    setDescription('');
    setActiveTab('general');
    onClose();
  };

  // Priority color map
  const priorityColor = {
    Low: '#10b981',
    Medium: '#f59e0b',
    High: '#f97316',
    Critical: '#ef4444'
  }[priority];

  // Header quick actions
  const headerActions = (
    <div className="create-ticket-header-actions">
      <button 
        type="button" 
        className={`create-ticket-header-btn ${isCameraActive ? 'active-camera' : ''}`}
        title="Capture fresh live snapshot"
        onClick={() => {
          showToast('Fresh high-resolution snapshot captured from Construction Site 360');
        }}
      >
        <Camera size={16} />
      </button>

      <button 
        type="button" 
        className="create-ticket-header-btn"
        title="Camera & Ticketing Settings"
        onClick={() => {
          showToast('Opened ticketing & stream camera preferences.');
        }}
      >
        <Settings size={16} />
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Ticket"
      icon={<Ticket size={20} />}
      headerActions={headerActions}
      maxWidth="900px"
      footer={
        <div className="create-ticket-footer">
          <button 
            type="button" 
            className="create-ticket-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="admin-primary-btn create-ticket-submit-btn"
            onClick={handleCreate}
          >
            Create Ticket
          </button>
        </div>
      }
    >
      <div className="create-ticket-dialog">
        {/* Navigation Sub-Tabs Bar (Matching Image 2 Reference) */}
        <div className="admin-subtabs-bar" role="tablist" style={{ marginBottom: '22px' }}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'general'}
            className={`admin-subtab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <span className="admin-subtab-icon-badge">
              <FileText size={16} />
            </span>
            <span>General</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'additional'}
            className={`admin-subtab-btn ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            <span className="admin-subtab-icon-badge">
              <SlidersHorizontal size={16} />
            </span>
            <span>Additional</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'activity'}
            className={`admin-subtab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <span className="admin-subtab-icon-badge">
              <History size={16} />
            </span>
            <span>Activity</span>
          </button>
        </div>

        {/* TAB 1: GENERAL (2-COLUMN REFERENCE UI) */}
        {activeTab === 'general' && (
          <div className="create-ticket-body-grid">
            {/* Left Column: Form Fields */}
            <div className="create-ticket-form-col">
              {/* Title Field with Voice Mic Button */}
              <div className="create-ticket-title-row">
                <div className="create-ticket-title-input">
                  <TextField 
                    label="Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter ticket title..."
                    autoFocus
                  />
                </div>
                <button 
                  type="button" 
                  className={`create-ticket-mic-btn ${isListening ? 'recording' : ''}`}
                  onClick={handleMicToggle}
                  title={isListening ? "Listening... click to stop" : "Speak to fill title"}
                >
                  <Mic size={18} />
                </button>
              </div>

              {/* Floating Label Textarea for Description */}
              <div className="create-ticket-textarea-field">
                <div className={`tf-wrapper create-ticket-textarea-wrapper ${focusedField === 'description' ? 'tf-focused' : ''}`}>
                  <fieldset className="tf-outline" aria-hidden="true">
                    <legend className="tf-legend">Description</legend>
                  </fieldset>
                  <label htmlFor="ticket-description" className="tf-sr-label">Description</label>
                  <textarea
                    id="ticket-description"
                    className="create-ticket-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed description of the issue..."
                    onFocus={() => setFocusedField('description')}
                    onBlur={() => setFocusedField(null)}
                    rows={4}
                  />
                  <button 
                    type="button" 
                    className="create-ticket-attachment-btn"
                    onClick={handleAttachment}
                    title="Attach files or screenshots"
                  >
                    <Paperclip size={16} />
                  </button>
                </div>
              </div>

              {/* Ticket Type Dropdown */}
              <TextField 
                as="select"
                label="Ticket Type"
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                options={[
                  { value: 'Standard', label: 'Standard' },
                  { value: 'Incident', label: 'Incident' },
                  { value: 'Security Alert', label: 'Security Alert' },
                  { value: 'Maintenance Task', label: 'Maintenance Task' },
                  { value: 'Equipment Fault', label: 'Equipment Fault' }
                ]}
              />

              {/* Bottom Split Row: Priority & Assignee */}
              <div className="create-ticket-split-row">
                {/* Priority Selector */}
                <TextField 
                  as="select"
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  options={[
                    { value: 'Low', label: '● Low' },
                    { value: 'Medium', label: '● Medium' },
                    { value: 'High', label: '● High' },
                    { value: 'Critical', label: '● Critical' }
                  ]}
                />

                {/* Assignee Selector */}
                <TextField 
                  as="select"
                  label="Assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  options={[
                    { value: 'Michael Reed', label: 'Michael Reed' },
                    { value: 'Ava Sharma', label: 'Ava Sharma' },
                    { value: 'Sarah Wilson', label: 'Sarah Wilson' },
                    { value: 'Unassigned', label: 'Unassigned' }
                  ]}
                />
              </div>
            </div>

            {/* Right Column: Live Camera Snapshot Preview Card */}
            <div className="create-ticket-snapshot-card">
              <img 
                src="/images/construction-site-snapshot.jpg" 
                alt="Construction Site Live Camera View"
                className="create-ticket-snapshot-img"
              />
              <div className="create-ticket-snapshot-scrim" />

              {/* Top Header Overlay */}
              <div className="create-ticket-snapshot-top">
                <span className="create-ticket-timestamp-badge">
                  {liveTimestamp}
                </span>

                <label 
                  className="create-ticket-toggle-switch"
                  title={isCameraActive ? "Live stream active" : "Live stream paused"}
                >
                  <input 
                    type="checkbox" 
                    checked={isCameraActive} 
                    onChange={(e) => setIsCameraActive(e.target.checked)} 
                  />
                  <span className="create-ticket-toggle-slider" />
                </label>
              </div>

              {/* Map Location Pin Marker */}
              <div 
                className="create-ticket-snapshot-pin"
                title="Marked incident location: Crane North Ground"
                onClick={() => showToast('Focus moved to pinpointed coordinates (37.7749° N, 122.4194° W)')}
              >
                <div className="create-ticket-pin-circle">
                  <MapPin size={18} />
                </div>
              </div>

              {/* Bottom Bar Overlay */}
              <div className="create-ticket-snapshot-bottom">
                <span className="create-ticket-camera-name-badge">
                  Construction Site 360
                </span>

                <div className="create-ticket-snapshot-tools">
                  <button 
                    type="button" 
                    className="create-ticket-tool-btn"
                    title="Crop snapshot region"
                    onClick={() => showToast('Crop framing tool active. Drag bounding box.')}
                  >
                    <Crop size={15} />
                  </button>

                  <button 
                    type="button" 
                    className="create-ticket-tool-btn"
                    title="Annotate on snapshot"
                    onClick={() => showToast('Pen markup mode enabled. Draw directly on canvas.')}
                  >
                    <Pencil size={15} />
                  </button>

                  <button 
                    type="button" 
                    className="create-ticket-tool-btn"
                    title="Expand fullscreen view"
                    onClick={() => showToast('Opened full 360° interactive viewer.')}
                  >
                    <Maximize2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADDITIONAL CONFIGURATION (Matching Image 2 Reference) */}
        {activeTab === 'additional' && (
          <div className="create-ticket-additional-grid">
            {/* Left Card: Deadline & Action */}
            <div className="create-ticket-panel-card">
              <div className="create-ticket-panel-header">
                <div className="create-ticket-panel-title">
                  <Clock size={16} />
                  <span>Deadline & Action</span>
                </div>
              </div>

              {/* Due Date & Time Field with Custom Notched Outline */}
              <div className="create-ticket-datetime-field">
                <div className={`tf-wrapper create-ticket-datetime-wrapper ${isDateTimeFocused ? 'tf-focused' : ''}`}>
                  <fieldset className="tf-outline" aria-hidden="true">
                    <legend className="tf-legend">Due Date & Time</legend>
                  </fieldset>
                  <label className="tf-sr-label">Due Date & Time</label>
                  <div className="create-ticket-datetime-inner">
                    <div className="create-ticket-datetime-part">
                      <Calendar size={15} className="create-ticket-field-icon" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="create-ticket-datetime-input"
                        placeholder="dd-mm-yyyy"
                        onFocus={() => setIsDateTimeFocused(true)}
                        onBlur={() => setIsDateTimeFocused(false)}
                      />
                    </div>
                    <div className="create-ticket-datetime-divider" />
                    <div className="create-ticket-datetime-part">
                      <Clock size={15} className="create-ticket-field-icon" />
                      <input
                        type="time"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        className="create-ticket-datetime-input"
                        placeholder="--:--"
                        onFocus={() => setIsDateTimeFocused(true)}
                        onBlur={() => setIsDateTimeFocused(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* On Breach Select Field */}
              <TextField 
                as="select"
                label="On Breach"
                value={onBreachAction}
                onChange={(e) => setOnBreachAction(e.target.value)}
                options={[
                  { value: 'Select action', label: 'Select action' },
                  { value: 'Notify Assignee & Manager', label: 'Notify Assignee & Manager' },
                  { value: 'Escalate to High Priority', label: 'Escalate to High Priority' },
                  { value: 'Auto-reassign Ticket', label: 'Auto-reassign Ticket' },
                  { value: 'Trigger Webhook Alert', label: 'Trigger Webhook Alert' }
                ]}
              />
            </div>

            {/* Right Card: Ticket Dependencies */}
            <div className="create-ticket-panel-card">
              <div className="create-ticket-panel-header">
                <div className="create-ticket-panel-title">
                  <Link2 size={16} />
                  <span>Ticket Dependencies</span>
                </div>
                <button 
                  type="button" 
                  className="create-ticket-link-ticket-btn"
                  onClick={() => {
                    if (linkedTickets.length === 0) {
                      setLinkedTickets(['TKT-2041 (Site Access Permit #12)']);
                      showToast('Linked dependency: TKT-2041');
                    } else {
                      showToast('Ticket dependency search dialog opened.');
                    }
                  }}
                >
                  <Plus size={14} />
                  <span>Link Ticket</span>
                </button>
              </div>

              {linkedTickets.length === 0 ? (
                <div className="create-ticket-empty-dependencies">
                  <div className="create-ticket-empty-icon-circle">
                    <Link2 size={26} />
                  </div>
                  <span className="create-ticket-empty-title">No linked tickets yet</span>
                  <span className="create-ticket-empty-desc">Link related tickets to show dependencies.</span>
                </div>
              ) : (
                <div className="create-ticket-linked-list">
                  {linkedTickets.map((tkt, idx) => (
                    <div key={idx} className="create-ticket-linked-pill">
                      <Link2 size={14} />
                      <span>{tkt}</span>
                      <button 
                        type="button"
                        className="create-ticket-linked-remove"
                        onClick={() => setLinkedTickets([])}
                        title="Remove dependency"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVITY HISTORY (Balanced 2-Column Enterprise Layout) */}
        {activeTab === 'activity' && (
          <div className="create-ticket-activity-grid">
            {/* Left Card: Activity Timeline */}
            <div className="create-ticket-panel-card">
              <div className="create-ticket-panel-header">
                <div className="create-ticket-panel-title">
                  <History size={16} />
                  <span>Activity Timeline</span>
                </div>
                <span className="create-ticket-activity-badge">Auto-logged</span>
              </div>

              <div className="create-ticket-activity-timeline">
                {/* Item 1: Ticket Created */}
                <div className="create-ticket-timeline-item">
                  <div className="create-ticket-timeline-rail">
                    <div className="create-ticket-timeline-node" />
                    <div className="create-ticket-timeline-line" />
                  </div>
                  <div className="create-ticket-timeline-content">
                    <div className="create-ticket-timeline-row">
                      <h4 className="create-ticket-timeline-heading">Ticket Created</h4>
                      <span className="create-ticket-timeline-time-badge">Just now</span>
                    </div>
                    <p className="create-ticket-timeline-primary-text">Reported by Michael Reed</p>
                    <p className="create-ticket-timeline-secondary-text">Recorded when you create the ticket</p>
                  </div>
                </div>

                {/* Item 2: Assigned */}
                <div className="create-ticket-timeline-item">
                  <div className="create-ticket-timeline-rail">
                    <div className="create-ticket-timeline-node" />
                    <div className="create-ticket-timeline-line" />
                  </div>
                  <div className="create-ticket-timeline-content">
                    <div className="create-ticket-timeline-row">
                      <h4 className="create-ticket-timeline-heading">Assigned</h4>
                      <span className="create-ticket-timeline-time-badge">On submit</span>
                    </div>
                    <p className="create-ticket-timeline-primary-text">{assignee} on Construction Site 360</p>
                    <p className="create-ticket-timeline-secondary-text">Assigned on creation</p>
                  </div>
                </div>

                {/* Item 3: Status */}
                <div className="create-ticket-timeline-item">
                  <div className="create-ticket-timeline-rail">
                    <div className="create-ticket-timeline-node" />
                    <div className="create-ticket-timeline-line" />
                  </div>
                  <div className="create-ticket-timeline-content">
                    <div className="create-ticket-timeline-row">
                      <h4 className="create-ticket-timeline-heading">Status</h4>
                      <span className="create-ticket-timeline-time-badge">Default</span>
                    </div>
                    <p className="create-ticket-timeline-primary-text">To Do</p>
                    <p className="create-ticket-timeline-secondary-text">Default workflow state</p>
                  </div>
                </div>

                {/* Item 4: Snapshot Evidence */}
                <div className="create-ticket-timeline-item">
                  <div className="create-ticket-timeline-rail">
                    <div className="create-ticket-timeline-node" />
                  </div>
                  <div className="create-ticket-timeline-content">
                    <div className="create-ticket-timeline-row">
                      <h4 className="create-ticket-timeline-heading">Evidence Attached</h4>
                      <span className="create-ticket-timeline-time-badge">Auto</span>
                    </div>
                    <p className="create-ticket-timeline-primary-text">Live 360 snapshot & GPS coordinates</p>
                    <p className="create-ticket-timeline-secondary-text">Attached from Construction Site 360</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Audit Summary & Dispatch Note */}
            <div className="create-ticket-panel-card">
              <div className="create-ticket-panel-header">
                <div className="create-ticket-panel-title">
                  <ShieldCheck size={16} />
                  <span>Audit & System Details</span>
                </div>
                <span className="create-ticket-sync-indicator">
                  <span className="create-ticket-sync-dot" />
                  Jira Sync Ready
                </span>
              </div>

              {/* 2x2 Metadata Cards Grid */}
              <div className="create-ticket-audit-metrics-grid">
                <div className="create-ticket-audit-metric-box">
                  <span className="create-ticket-audit-metric-label">Reporter</span>
                  <div className="create-ticket-audit-metric-value">
                    <div className="create-ticket-avatar-circle">MR</div>
                    <span>Michael Reed</span>
                  </div>
                </div>

                <div className="create-ticket-audit-metric-box">
                  <span className="create-ticket-audit-metric-label">Source Stream</span>
                  <div className="create-ticket-audit-metric-value">
                    <Camera size={14} className="create-ticket-field-icon" />
                    <span>Site 360</span>
                  </div>
                </div>

                <div className="create-ticket-audit-metric-box">
                  <span className="create-ticket-audit-metric-label">SLA Target</span>
                  <div className="create-ticket-audit-metric-value">
                    <Clock size={14} className="create-ticket-field-icon" />
                    <span>4h Response</span>
                  </div>
                </div>

                <div className="create-ticket-audit-metric-box">
                  <span className="create-ticket-audit-metric-label">Target Jira Project</span>
                  <div className="create-ticket-audit-metric-value">
                    <Check size={14} style={{ color: '#10b981' }} />
                    <span>SITE-OPS</span>
                  </div>
                </div>
              </div>

              {/* Dispatch Note Input */}
              <div className="create-ticket-dispatch-note-box">
                <div className={`tf-wrapper create-ticket-textarea-wrapper ${isNoteFocused ? 'tf-focused' : ''}`}>
                  <fieldset className="tf-outline" aria-hidden="true">
                    <legend className="tf-legend">Activity / Dispatch Note (Optional)</legend>
                  </fieldset>
                  <label htmlFor="activity-note" className="tf-sr-label">Activity / Dispatch Note</label>
                  <textarea
                    id="activity-note"
                    className="create-ticket-textarea"
                    value={activityNote}
                    onChange={(e) => setActivityNote(e.target.value)}
                    placeholder="Add instructions or handover notes for the assignee..."
                    onFocus={() => setIsNoteFocused(true)}
                    onBlur={() => setIsNoteFocused(false)}
                    rows={3}
                    style={{ minHeight: '65px', maxHeight: '95px' }}
                  />
                  <div className="create-ticket-dispatch-note-footer">
                    <MessageSquare size={13} className="create-ticket-field-icon" />
                    <span>Note will be recorded in ticket history upon creation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

