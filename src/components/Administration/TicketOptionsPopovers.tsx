import React, { useRef, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ChevronDown 
} from 'lucide-react';
import './TicketOptionsPopovers.css';

/* ==========================================================================
   1. TRENDS CARD (Image 1 Reference)
   ========================================================================== */
interface TrendsPopoverCardProps {
  isOpen: boolean;
  onClose: () => void;
  ticketCounts?: {
    total: number;
    todo: number;
    closed: number;
    accepted: number;
    failed: number;
  };
}

export function TrendsPopoverCard({
  isOpen,
  onClose,
  ticketCounts = { total: 0, todo: 0, closed: 0, accepted: 0, failed: 0 }
}: TrendsPopoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ticket-popover-card trends-popover-card" ref={cardRef}>
      {/* Header Row */}
      <div className="trends-header-row">
        <div className="trends-header-left">
          <TrendingUp size={16} color="#10b981" strokeWidth={2.5} />
          <span>IMPROVEMENTS</span>
        </div>
        <span className="trends-header-right">All sites in view</span>
      </div>

      {/* Headline Metric */}
      <div className="trends-headline-row">
        <span className="trends-big-num">{ticketCounts.total}</span>
        <span className="trends-headline-desc">total improvements across {ticketCounts.total} tickets</span>
      </div>

      {/* 4 Status Pill Boxes */}
      <div className="trends-stat-boxes-grid">
        <div className="trends-stat-box box-todo">
          <span className="trends-stat-box-num">{ticketCounts.todo}</span>
          <span className="trends-stat-box-label">To Do</span>
        </div>
        <div className="trends-stat-box box-closed">
          <span className="trends-stat-box-num">{ticketCounts.closed}</span>
          <span className="trends-stat-box-label">Closed</span>
        </div>
        <div className="trends-stat-box box-accepted">
          <span className="trends-stat-box-num">{ticketCounts.accepted}</span>
          <span className="trends-stat-box-label">Accepted</span>
        </div>
        <div className="trends-stat-box box-failed">
          <span className="trends-stat-box-num">{ticketCounts.failed}</span>
          <span className="trends-stat-box-label">Failed</span>
        </div>
      </div>

      <div className="trends-divider" />

      {/* Mid Metrics */}
      <div className="trends-mid-metrics-row">
        <div className="trends-mid-metric-col">
          <span className="trends-mid-label">Improvements this week</span>
          <span className="trends-mid-val">{ticketCounts.total}</span>
        </div>
        <div className="trends-mid-metric-col">
          <span className="trends-mid-label">Avg resolution time</span>
          <span className="trends-mid-val">—</span>
        </div>
      </div>

      {/* Open vs Closed 8 Days Chart */}
      <div className="trends-chart-section">
        <div className="trends-chart-header">
          <span className="trends-chart-title">OPEN VS CLOSED · 8 DAYS</span>
          <div className="trends-chart-legend">
            <span className="trends-legend-item">
              <span className="trends-legend-dot dot-raised" />
              <span>Raised</span>
            </span>
            <span className="trends-legend-item">
              <span className="trends-legend-dot dot-closed" />
              <span>Closed</span>
            </span>
          </div>
        </div>

        <div className="trends-bars-row">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="trends-bar-pair">
              <div className="trends-bar-segment seg-raised" />
              <div className="trends-bar-segment seg-closed" />
            </div>
          ))}
        </div>
      </div>

      {/* By Site and Camera */}
      <div className="trends-site-section">
        <span className="trends-site-title">BY SITE AND CAMERA</span>
        <span className="trends-site-content">
          {ticketCounts.total === 0 ? 'No tickets in view.' : 'Construction Site 360 (7) · Warehouse (2)'}
        </span>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. TICKET SIZE CARD (Image 2 Reference)
   ========================================================================== */
interface TicketSizePopoverCardProps {
  isOpen: boolean;
  onClose: () => void;
  size: number;
  onChange: (size: number) => void;
}

export function TicketSizePopoverCard({
  isOpen,
  onClose,
  size,
  onChange
}: TicketSizePopoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ticket-popover-card ticket-size-popover-card" ref={cardRef}>
      <div className="ticket-size-top-row">
        <span className="ticket-size-title">Ticket size</span>
        <span className="ticket-size-val">{size}px</span>
      </div>

      <div className="ticket-size-slider-wrap">
        <input 
          type="range"
          min="16"
          max="48"
          step="2"
          value={size}
          onChange={(e) => onChange(Number(e.target.value))}
          className="ticket-size-slider"
          aria-label="Ticket marker size"
        />
      </div>

      <div className="ticket-size-labels-row">
        <span>Small</span>
        <span>Large</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. FILTER CARD (Image 3 Reference)
   ========================================================================== */
interface TicketFilterPopoverCardProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    fromDate: string;
    toDate: string;
    status: string;
    camera: string;
    creator: string;
    assignee: string;
  };
  onChange: (filters: any) => void;
  onClear: () => void;
}

export function TicketFilterPopoverCard({
  isOpen,
  onClose,
  filters,
  onChange,
  onClear
}: TicketFilterPopoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ticket-popover-card filter-popover-card" ref={cardRef}>
      <div className="filter-grid">
        {/* Row 1: From & To Date Pickers */}
        <label className="filter-date-tile">
          <span className="filter-date-label">From</span>
          <div className="filter-date-row">
            <input 
              type="text" 
              placeholder="dd-mm-yyyy"
              value={filters.fromDate}
              onChange={(e) => onChange({ ...filters, fromDate: e.target.value })}
              className="filter-date-input"
            />
            <Calendar size={15} className="filter-calendar-icon" />
          </div>
        </label>

        <label className="filter-date-tile">
          <span className="filter-date-label">To</span>
          <div className="filter-date-row">
            <input 
              type="text" 
              placeholder="dd-mm-yyyy"
              value={filters.toDate}
              onChange={(e) => onChange({ ...filters, toDate: e.target.value })}
              className="filter-date-input"
            />
            <Calendar size={15} className="filter-calendar-icon" />
          </div>
        </label>

        {/* Row 2: Status & Camera Notched Dropdowns */}
        <div className="filter-notched-tile">
          <fieldset className="filter-notched-outline">
            <legend className="filter-notched-legend">Status</legend>
          </fieldset>
          <select 
            className="filter-select"
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            aria-label="Filter by Status"
          >
            <option value="Any">Any</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Post-approval">Pending Post-approval</option>
            <option value="Done">Done</option>
          </select>
          <ChevronDown size={14} className="filter-chevron-icon" />
        </div>

        <div className="filter-notched-tile">
          <fieldset className="filter-notched-outline">
            <legend className="filter-notched-legend">Camera</legend>
          </fieldset>
          <select 
            className="filter-select"
            value={filters.camera}
            onChange={(e) => onChange({ ...filters, camera: e.target.value })}
            aria-label="Filter by Camera"
          >
            <option value="Any">Any</option>
            <option value="Construction Site 360">Construction Site 360</option>
            <option value="Warehouse 360">Warehouse 360</option>
            <option value="Main Gate PTZ">Main Gate PTZ</option>
          </select>
          <ChevronDown size={14} className="filter-chevron-icon" />
        </div>

        {/* Row 3: Creator & Assignee Notched Dropdowns */}
        <div className="filter-notched-tile">
          <fieldset className="filter-notched-outline">
            <legend className="filter-notched-legend">Creator</legend>
          </fieldset>
          <select 
            className="filter-select"
            value={filters.creator}
            onChange={(e) => onChange({ ...filters, creator: e.target.value })}
            aria-label="Filter by Creator"
          >
            <option value="Any">Any</option>
            <option value="Michael Reed">Michael Reed</option>
            <option value="Ava Sharma">Ava Sharma</option>
            <option value="Sarah Wilson">Sarah Wilson</option>
          </select>
          <ChevronDown size={14} className="filter-chevron-icon" />
        </div>

        <div className="filter-notched-tile">
          <fieldset className="filter-notched-outline">
            <legend className="filter-notched-legend">Assignee</legend>
          </fieldset>
          <select 
            className="filter-select"
            value={filters.assignee}
            onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
            aria-label="Filter by Assignee"
          >
            <option value="Any">Any</option>
            <option value="Michael Reed">Michael Reed</option>
            <option value="Ava Sharma">Ava Sharma</option>
            <option value="Sarah Wilson">Sarah Wilson</option>
            <option value="Unassigned">Unassigned</option>
          </select>
          <ChevronDown size={14} className="filter-chevron-icon" />
        </div>
      </div>

      {/* Footer Clear Button */}
      <div className="filter-footer-row">
        <button 
          type="button" 
          className="filter-clear-btn"
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
