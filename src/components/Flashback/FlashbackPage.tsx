import React, { useState, useMemo, useEffect } from 'react';
import {
  History,
  Video,
  Camera,
  Radio,
  Settings,
  Info,
  Play,
  Pause,
  Download,
  AlertCircle,
  Film,
  Clock,
  Trash2,
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../shared/Card';
import { PageHeader } from '../shared/PageHeader';
import { Badge } from '../shared/Badge';
import { SearchField } from '../shared/SearchField';
import { CustomSmoothDropdown } from '../shared/CustomSmoothDropdown';
import { Modal } from '../shared/Modal';
import { RowsPerPageSelector } from '../shared/RowsPerPageSelector';
import '../AccountSettings/AccountSettings.css';
import '../shared/SharedUI.css';
import './FlashbackPage.css';

export interface CameraData {
  id: string;
  name: string;
  type: '360°' | 'PTZ' | 'Fixed';
  status: 'live' | 'offline';
  storage: 'Local SSD' | 'Cloud Vault' | 'Edge NVR';
  resolution: string;
  fps: number;
  location: string;
}

const DEFAULT_CAMERAS: CameraData[] = [
  {
    id: 'cam-01',
    name: 'Cafeteria Counter',
    type: 'Fixed',
    status: 'offline',
    storage: 'Local SSD',
    resolution: '1080p FHD',
    fps: 30,
    location: 'Building A - Ground Floor'
  },
  {
    id: 'cam-02',
    name: 'Chennai Rooftop 360',
    type: '360°',
    status: 'live',
    storage: 'Cloud Vault',
    resolution: '4K UHD',
    fps: 30,
    location: 'Tower East - Roof Observatory'
  },
  {
    id: 'cam-03',
    name: 'Loading Dock & Bay 4',
    type: 'Fixed',
    status: 'offline',
    storage: 'Edge NVR',
    resolution: '1080p FHD',
    fps: 30,
    location: 'Logistics Facility'
  },
  {
    id: 'cam-04',
    name: 'Main Gate PTZ',
    type: 'PTZ',
    status: 'live',
    storage: 'Cloud Vault',
    resolution: '4K UHD',
    fps: 60,
    location: 'Perimeter Entry Gate'
  },
  {
    id: 'cam-05',
    name: 'Perimeter East Fence',
    type: 'Fixed',
    status: 'live',
    storage: 'Edge NVR',
    resolution: '1080p FHD',
    fps: 30,
    location: 'East Perimeter Line'
  },
  {
    id: 'cam-06',
    name: 'Server Room Data Vault',
    type: 'Fixed',
    status: 'live',
    storage: 'Local SSD',
    resolution: '4K UHD',
    fps: 60,
    location: 'Building B - Secure Core'
  },
  {
    id: 'cam-07',
    name: 'Street West PTZ',
    type: 'PTZ',
    status: 'live',
    storage: 'Cloud Vault',
    resolution: '4K UHD',
    fps: 30,
    location: 'West Avenue Crossroad'
  },
  {
    id: 'cam-08',
    name: 'Warehouse Aisle B3',
    type: 'Fixed',
    status: 'offline',
    storage: 'Local SSD',
    resolution: '1080p FHD',
    fps: 30,
    location: 'Distribution Hub'
  }
];

const HISTORICAL_RECORDINGS = [
  {
    id: 'rec-01',
    title: 'CAM-01: Perimeter Gate Trigger Event',
    cameraId: 'cam-04',
    duration: '14m 20s',
    time: '14:22:10 Today',
    size: '420 MB',
    eventType: 'Perimeter Alert'
  },
  {
    id: 'rec-02',
    title: 'CAM-03: Server Room Access Event',
    cameraId: 'cam-06',
    duration: '08m 45s',
    time: '11:05:42 Today',
    size: '210 MB',
    eventType: 'Door Access'
  },
  {
    id: 'rec-03',
    title: 'CAM-02: Loading Bay Vehicle Detection',
    cameraId: 'cam-03',
    duration: '32m 10s',
    time: '09:14:00 Today',
    size: '1.1 GB',
    eventType: 'Motion Detection'
  },
  {
    id: 'rec-04',
    title: 'CAM-04: East Corridor Automated Patrol',
    cameraId: 'cam-05',
    duration: '45m 00s',
    time: '04:00:15 Today',
    size: '1.4 GB',
    eventType: 'Patrol'
  }
];

export interface RecordingHistoryItem {
  id: string;
  thumbnail: string;
  createdDate: string;
  createdTime: string;
  completedDate: string;
  completedTime: string;
  duration: string;
  location: string;
  cameraName: string;
  cameraId: string;
  resolution: string;
  size: string;
}

const EXACT_TOP_RECORDINGS: Partial<RecordingHistoryItem>[] = [
  { createdTime: '11:19:57 AM', completedTime: '11:20:01 AM', duration: '5s' },
  { createdTime: '11:19:53 AM', completedTime: '11:19:55 AM', duration: '2s' },
  { createdTime: '11:19:45 AM', completedTime: '11:19:51 AM', duration: '6s' },
  { createdTime: '11:19:40 AM', completedTime: '11:19:42 AM', duration: '3s' },
  { createdTime: '11:19:34 AM', completedTime: '11:19:39 AM', duration: '6s' },
  { createdTime: '11:19:26 AM', completedTime: '11:19:32 AM', duration: '6s' },
  { createdTime: '11:19:15 AM', completedTime: '11:19:20 AM', duration: '5s' },
  { createdTime: '11:19:04 AM', completedTime: '11:19:10 AM', duration: '6s' },
  { createdTime: '11:18:50 AM', completedTime: '11:18:54 AM', duration: '4s' },
  { createdTime: '11:18:32 AM', completedTime: '11:18:38 AM', duration: '6s' }
];

const generateHistoryRecordings = (total = 530): RecordingHistoryItem[] => {
  const items: RecordingHistoryItem[] = [];
  const baseEpoch = new Date('2026-11-14T11:18:32').getTime();
  const durations = [5, 2, 6, 3, 6, 6, 4, 7, 5, 8, 3, 9, 6, 4];
  const cameras = [
    { id: 'cam-02', name: 'Chennai Rooftop 360', location: 'Chennai' },
    { id: 'cam-01', name: 'Cafeteria Counter', location: 'Chennai' },
    { id: 'cam-03', name: 'Loading Dock Bay 4', location: 'Chennai' },
    { id: 'cam-04', name: 'Main Gate PTZ', location: 'Chennai' },
    { id: 'cam-06', name: 'Server Room Data Vault', location: 'Chennai' },
    { id: 'cam-05', name: 'Perimeter East Fence', location: 'Chennai' }
  ];

  for (let i = 0; i < total; i++) {
    const cam = cameras[i % cameras.length];
    const frameIndex = (i % 24).toString().padStart(4, '0');

    if (i < EXACT_TOP_RECORDINGS.length) {
      const exact = EXACT_TOP_RECORDINGS[i];
      items.push({
        id: `rec-${(i + 1).toString().padStart(4, '0')}`,
        thumbnail: `/assets/frames/frame_${frameIndex}.jpg`,
        createdDate: 'Nov 14, 2026',
        createdTime: exact.createdTime!,
        completedDate: 'Nov 14, 2026',
        completedTime: exact.completedTime!,
        duration: exact.duration!,
        location: cam.location,
        cameraName: cam.name,
        cameraId: cam.id,
        resolution: '4K UHD',
        size: `${(parseFloat(exact.duration!) * 2.2).toFixed(1)} MB`
      });
    } else {
      const dur = durations[i % durations.length];
      const timeOffset = (i - 9) * 14 * 1000;
      const cDate = new Date(baseEpoch - timeOffset);
      const eDate = new Date(cDate.getTime() + dur * 1000);

      const formatTime = (d: Date) => {
        let h = d.getHours();
        const m = d.getMinutes().toString().padStart(2, '0');
        const s = d.getSeconds().toString().padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m}:${s} ${ampm}`;
      };

      items.push({
        id: `rec-${(i + 1).toString().padStart(4, '0')}`,
        thumbnail: `/assets/frames/frame_${frameIndex}.jpg`,
        createdDate: 'Nov 14, 2026',
        createdTime: formatTime(cDate),
        completedDate: 'Nov 14, 2026',
        completedTime: formatTime(eDate),
        duration: `${dur}s`,
        location: cam.location,
        cameraName: cam.name,
        cameraId: cam.id,
        resolution: '4K UHD',
        size: `${(dur * 2.1).toFixed(1)} MB`
      });
    }
  }
  return items;
};

const ALL_RECORDING_HISTORY: RecordingHistoryItem[] = generateHistoryRecordings(530);

export function FlashbackPage() {
  // Navigation Tab: 'live' | 'history'
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');

  // Live Tab Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [storageFilter, setStorageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [gridLayout, setGridLayout] = useState<'1x1' | '2x2' | '3x3' | '4x4'>('3x3');

  // API State & Handling (Preserves real data fetching, handles error, offers fallback)
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Modals & Active Actions
  const [selectedCameraForStream, setSelectedCameraForStream] = useState<CameraData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<{ id: string; top: number; left: number } | null>(null);

  // History Tab Controls
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyTimeframe, setHistoryTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [historyEventType, setHistoryEventType] = useState('all');
  const [activeTimelineTime] = useState('14:22:10');

  // Recording History Tab Controls & Pagination (matching Reference UI)
  const [historyLocation, setHistoryLocation] = useState<string>('Chennai');
  const [historyDate, setHistoryDate] = useState<string>('11/14/2026');
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState<number>(10);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [selectedRecordingForPlayback, setSelectedRecordingForPlayback] = useState<RecordingHistoryItem | null>(null);
  const [isRecordingPlaying, setIsRecordingPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(45);

  // Playback timer simulation
  useEffect(() => {
    if (!selectedRecordingForPlayback || !isRecordingPlaying) return;
    const interval = setInterval(() => {
      setPlaybackProgress(prev => (prev >= 100 ? 0 : prev + 5));
    }, 400);
    return () => clearInterval(interval);
  }, [selectedRecordingForPlayback, isRecordingPlaying]);

  // Camera data fetching function (corrects endpoint to /api/cameras instead of duplicate /api/api/cameras)
  const fetchCamerasFromApi = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Direct call to correct API endpoint
      const response = await fetch('/api/cameras');
      if (!response.ok) {
        throw new Error(`Cannot GET /api/cameras (HTTP ${response.status})`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setCameras(data);
        setUseFallback(false);
      } else {
        // If empty data returned from server
        setCameras(DEFAULT_CAMERAS);
      }
    } catch (err: any) {
      setApiError(err?.message || 'Cannot GET /api/cameras');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCamerasFromApi();
  }, []);

  // Close action menus on outside click or scroll
  useEffect(() => {
    const handleClose = () => setActiveMenu(null);
    if (activeMenu) {
      document.addEventListener('click', handleClose);
      window.addEventListener('resize', handleClose);
      window.addEventListener('scroll', handleClose, true);
    }
    return () => {
      document.removeEventListener('click', handleClose);
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [activeMenu]);

  // Determine active cameras list (API cameras or fallback mock feeds when requested)
  const effectiveCameras = useMemo(() => {
    if (useFallback) return DEFAULT_CAMERAS;
    if (cameras.length > 0) return cameras;
    return [];
  }, [cameras, useFallback]);

  // Filter and sort cameras for Live Tab
  const filteredCameras = useMemo(() => {
    return effectiveCameras.filter(cam => {
      const matchSearch = !searchQuery ||
        cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || cam.status === statusFilter;
      const matchMode = modeFilter === 'all' ||
        (modeFilter === '360' && cam.type === '360°') ||
        (modeFilter === 'ptz' && cam.type === 'PTZ') ||
        (modeFilter === 'fixed' && cam.type === 'Fixed');
      const matchStorage = storageFilter === 'all' ||
        (storageFilter === 'local' && cam.storage === 'Local SSD') ||
        (storageFilter === 'cloud' && cam.storage === 'Cloud Vault') ||
        (storageFilter === 'edge' && cam.storage === 'Edge NVR');

      return matchSearch && matchStatus && matchMode && matchStorage;
    }).sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortBy === 'fps') cmp = a.fps - b.fps;
      else if (sortBy === 'storage') cmp = a.storage.localeCompare(b.storage);
      return sortAsc ? cmp : -cmp;
    });
  }, [effectiveCameras, searchQuery, statusFilter, modeFilter, storageFilter, sortBy, sortAsc]);

  // Filter historical recordings for History Tab
  const filteredRecordings = useMemo(() => {
    return HISTORICAL_RECORDINGS.filter(rec => {
      const matchSearch = !historySearchQuery ||
        rec.title.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        rec.cameraId.toLowerCase().includes(historySearchQuery.toLowerCase());
      const matchType = historyEventType === 'all' || rec.eventType.toLowerCase() === historyEventType.toLowerCase();
      return matchSearch && matchType;
    });
  }, [historySearchQuery, historyEventType]);

  // Filter history recordings by location and date (matching Reference UI)
  const filteredHistoryRecordings = useMemo(() => {
    return ALL_RECORDING_HISTORY.filter(rec => {
      const matchLocation = historyLocation === 'all' || rec.location.toLowerCase() === historyLocation.toLowerCase();
      const matchDate = !historyDate || rec.createdDate.includes('Nov 14') || historyDate === '11/14/2026';
      return matchLocation && matchDate;
    });
  }, [historyLocation, historyDate]);

  const totalHistoryCount = filteredHistoryRecordings.length;
  const totalPages = Math.ceil(totalHistoryCount / historyRowsPerPage) || 1;

  const paginatedRecordings = useMemo(() => {
    const startIndex = (historyPage - 1) * historyRowsPerPage;
    return filteredHistoryRecordings.slice(startIndex, startIndex + historyRowsPerPage);
  }, [filteredHistoryRecordings, historyPage, historyRowsPerPage]);

  const startEntry = totalHistoryCount === 0 ? 0 : (historyPage - 1) * historyRowsPerPage + 1;
  const endEntry = Math.min(historyPage * historyRowsPerPage, totalHistoryCount);

  const handleOpenMenu = (camId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 170;
    const menuHeight = 125;
    const openUpwards = rect.bottom + menuHeight > window.innerHeight;

    setActiveMenu({
      id: camId,
      top: openUpwards ? Math.max(10, rect.top - menuHeight - 6) : rect.bottom + 6,
      left: Math.max(12, Math.min(window.innerWidth - menuWidth - 12, rect.right - menuWidth))
    });
  };

  const handleDeleteCamera = (id: string) => {
    setCameras(prev => prev.filter(c => c.id !== id));
    setActiveMenu(null);
  };

  // Grid column CSS style based on gridLayout
  const gridColumnsStyle = useMemo(() => {
    switch (gridLayout) {
      case '1x1':
        return '1fr';
      case '2x2':
        return 'repeat(auto-fit, minmax(420px, 1fr))';
      case '4x4':
        return 'repeat(auto-fit, minmax(260px, 1fr))';
      case '3x3':
      default:
        return 'repeat(auto-fit, minmax(320px, 1fr))';
    }
  }, [gridLayout]);

  return (
    <div className="figma-account-settings-page-wrapper">
      <div className="figma-account-settings-container">
        {/* Page Header conforming to Base Application */}
        <PageHeader
          title="Flashback"
          subtitle=""
          icon={<History size={20} />}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            </div>
          }
        />

        {/* Tab Navigation Strip (Follows Standard Tab System) */}
        <div className="flashback-tabs-container" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'live'}
            onClick={() => setActiveTab('live')}
            className={`flashback-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
          >
            <span className="flashback-tab-icon-badge">
              <Video size={16} />
            </span>
            <span>Live . test</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            className={`flashback-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            <span className="flashback-tab-icon-badge">
              <History size={16} />
            </span>
            <span>History</span>
          </button>
        </div>

        {/* TAB 1: LIVE CAMERAS VIEW */}
        {activeTab === 'live' && (
          <Card>
            <CardHeader
              action={
                <button
                  type="button"
                  className="figma-btn-icon"
                  title="Live Grid Settings"
                  aria-label="Live Grid Settings"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings size={18} />
                </button>
              }
            >
              <CardTitle gradient={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '16px' }}>Live Cameras</span>
                  <span title="Real-time multi-channel optical feeds and monitoring grid" style={{ cursor: 'help', color: 'var(--text-muted)' }}>
                    <Info size={16} />
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardBody>
              {/* Controls Bar: Search, Filters, Sorting, Grid Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px'
                }}
              >
                {/* Left Controls: Search & Filter Dropdowns */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <SearchField
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search camera..."
                  />

                  <div style={{ width: '135px' }}>
                    <CustomSmoothDropdown
                      label="Status"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={[
                        { label: 'All Status', value: 'all' },
                        { label: 'Online / Live', value: 'live' },
                        { label: 'Offline', value: 'offline' }
                      ]}
                    />
                  </div>

                  <div style={{ width: '135px' }}>
                    <CustomSmoothDropdown
                      label="Mode"
                      value={modeFilter}
                      onChange={setModeFilter}
                      options={[
                        { label: 'All Modes', value: 'all' },
                        { label: '360° View', value: '360' },
                        { label: 'PTZ Pan-Tilt', value: 'ptz' },
                        { label: 'Fixed Lens', value: 'fixed' }
                      ]}
                    />
                  </div>

                  <div style={{ width: '140px' }}>
                    <CustomSmoothDropdown
                      label="Storage"
                      value={storageFilter}
                      onChange={setStorageFilter}
                      options={[
                        { label: 'All Storage', value: 'all' },
                        { label: 'Local SSD', value: 'local' },
                        { label: 'Cloud Vault', value: 'cloud' },
                        { label: 'Edge NVR', value: 'edge' }
                      ]}
                    />
                  </div>
                </div>

                {/* Right Controls: Sort & Grid Layout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '120px' }}>
                    <CustomSmoothDropdown
                      label="Sort By"
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { label: 'Name', value: 'name' },
                        { label: 'Status', value: 'status' },
                        { label: 'Storage', value: 'storage' },
                        { label: 'FPS', value: 'fps' }
                      ]}
                    />
                  </div>

                  <button
                    className="figma-btn-cancel"
                    onClick={() => setSortAsc(!sortAsc)}
                    title={sortAsc ? "Sort Ascending" : "Sort Descending"}
                    style={{ padding: '7px 11px', fontSize: '12.5px', height: '36px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {sortAsc ? '↑ Asc' : '↓ Desc'}
                  </button>

                  {/* Grid Layout Selector: 1x1, 2x2, 3x3, 4x4 */}
                  <div className="flashback-grid-selector" title="Grid Layout">
                    {(['1x1', '2x2', '3x3', '4x4'] as const).map(layout => (
                      <button
                        key={layout}
                        type="button"
                        className={`flashback-grid-btn ${gridLayout === layout ? 'active' : ''}`}
                        onClick={() => setGridLayout(layout)}
                      >
                        {layout}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* API ERROR / RETRY STATE (Exact match to user reference image) */}
              {apiError && !useFallback && (
                <div className="flashback-error-box">
                  <AlertCircle size={32} style={{ color: 'var(--danger, #ef4444)', marginBottom: '8px' }} />
                  <div className="flashback-error-title">Couldn't load cameras</div>
                  <div className="flashback-error-desc">{apiError}</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="figma-btn-save"
                      onClick={fetchCamerasFromApi}
                      disabled={isLoading}
                      style={{ padding: '7px 20px', fontSize: '13px' }}
                    >
                      {isLoading ? 'Retrying...' : 'Retry'}
                    </button>
                    <button
                      className="figma-btn-cancel"
                      onClick={() => setUseFallback(true)}
                      style={{ padding: '7px 16px', fontSize: '13px' }}
                    >
                      Load Local Cameras
                    </button>
                  </div>
                </div>
              )}

              {/* CAMERA CARDS GRID */}
              {(!apiError || useFallback) && (
                filteredCameras.length > 0 ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: gridColumnsStyle,
                      gap: '16px'
                    }}
                  >
                    {filteredCameras.map(cam => {
                      const isLive = cam.status === 'live';
                      return (
                        <div key={cam.id} className="camera-card">
                          {/* Stream Preview Box */}
                          <div className={`camera-preview-box ${isLive ? 'is-live' : ''}`}>
                            <div className="camera-preview-overlay" />

                            {/* Stream Status Badge */}
                            <div className={`camera-stream-badge ${isLive ? 'live' : 'offline'}`}>
                              <span className="camera-stream-dot" />
                              <span>{isLive ? 'LIVE' : 'OFFLINE'}</span>
                            </div>

                            {/* Camera Type Badge */}
                            <div className="camera-type-badge">
                              {cam.type}
                            </div>

                            {/* Interactive Feed Content */}
                            {isLive ? (
                              <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.75)', zIndex: 1 }}>
                                <Radio size={36} style={{ color: '#10b981', marginBottom: '8px', animation: 'pulse 2s infinite' }} />
                                <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.3px', color: '#fff' }}>
                                  OPTICAL FEED ACTIVE
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px' }}>
                                  {cam.resolution} • {cam.fps} FPS
                                </div>
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', color: 'var(--text-muted)', zIndex: 1 }}>
                                <Camera size={34} style={{ opacity: 0.35, marginBottom: '8px' }} />
                                <div style={{ fontSize: '12px', fontWeight: 500 }}>Stream Disconnected</div>
                              </div>
                            )}

                            {/* Hover Quick Action to Open Fullscreen Stream */}
                            {isLive && (
                              <button
                                className="figma-btn-save"
                                onClick={() => setSelectedCameraForStream(cam)}
                                title="Expand Live Optical Feed"
                                style={{
                                  position: 'absolute',
                                  bottom: '12px',
                                  right: '12px',
                                  padding: '5px 12px',
                                  fontSize: '11.5px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  zIndex: 3
                                }}
                              >
                                <Play size={12} /> Play
                              </button>
                            )}
                          </div>

                          {/* Camera Info Section utilizing Theme Studio surface */}
                          <div className="camera-card-info">
                            <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                              <div className="camera-name-text" title={cam.name}>
                                {cam.name}
                              </div>
                              <div className="camera-sub-text">
                                <span>{cam.storage}</span>
                                <span>•</span>
                                <span>{cam.location}</span>
                              </div>
                            </div>

                            <button
                              className="camera-menu-btn"
                              title="Camera options"
                              onClick={(e) => handleOpenMenu(cam.id, e)}
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <Camera size={36} style={{ color: 'var(--text-muted)', opacity: 0.4, margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      No cameras found
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px' }}>
                      No camera match your search query "{searchQuery}". Try searching with a different name or clear active filters.
                    </div>
                    <button
                      className="figma-btn-cancel"
                      onClick={() => { setSearchQuery(''); setStatusFilter('all'); setModeFilter('all'); setStorageFilter('all'); }}
                    >
                      Clear Filters
                    </button>
                  </div>
                )
              )}
            </CardBody>
          </Card>
        )}

        {/* TAB 2: HISTORY (RECORDING HISTORY TABLE - ALIGNED WITH REFERENCE UI) */}
        {activeTab === 'history' && (
          <div className="flashback-history-card">
            {/* Header: Recording History with Info Icon */}
            <div className="flashback-history-header">
              <div className="flashback-history-title-group">
                <span className="flashback-history-title">Recording History</span>
                <span
                  className="flashback-history-info-btn"
                  title="Historical video archive segments captured by triggered and continuous recording rules."
                >
                  <Info size={16} />
                </span>
              </div>
            </div>

            {/* Filter Controls Row: Location and Date */}
            <div className="flashback-history-filters">
              {/* Location Selector (CustomSmoothDropdown matching Reference Image 2) */}
              <div style={{ minWidth: '150px' }}>
                <CustomSmoothDropdown
                  label="Location"
                  value={historyLocation}
                  onChange={(val) => {
                    setHistoryLocation(val);
                    setHistoryPage(1);
                  }}
                  options={[
                    { label: 'Chennai', value: 'Chennai' },
                    { label: 'Bangalore Hub', value: 'Bangalore Hub' },
                    { label: 'Mumbai Facility', value: 'Mumbai Facility' },
                    { label: 'Delhi Core', value: 'Delhi Core' },
                    { label: 'All Locations', value: 'all' }
                  ]}
                />
              </div>

              {/* Date Selector */}
              <div className="flashback-filter-select-wrapper">
                <select
                  className="flashback-filter-select"
                  value={historyDate}
                  onChange={(e) => {
                    setHistoryDate(e.target.value);
                    setHistoryPage(1);
                  }}
                  aria-label="Filter by Date"
                >
                  <option value="11/14/2026">11/14/2026</option>
                  <option value="11/13/2026">11/13/2026</option>
                  <option value="11/12/2026">11/12/2026</option>
                  <option value="11/11/2026">11/11/2026</option>
                  <option value="11/10/2026">11/10/2026</option>
                  <option value="11/09/2026">11/09/2026</option>
                  <option value="11/08/2026">11/08/2026</option>
                </select>
                <ChevronDown size={14} className="flashback-filter-chevron" />
              </div>
            </div>

            {/* Recording History Data Table */}
            <div className="flashback-history-table-wrapper">
              <table className="flashback-history-table">
                <thead>
                  <tr>
                    <th style={{ width: '140px' }}>Recording Preview</th>
                    <th style={{ width: '220px' }}>Created</th>
                    <th style={{ width: '220px' }}>Completed</th>
                    <th style={{ width: '140px' }}>Duration</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecordings.map((rec) => (
                    <tr key={rec.id}>
                      {/* Recording Preview Thumbnail */}
                      <td>
                        <button
                          type="button"
                          className="flashback-preview-thumb"
                          onClick={() => {
                            setSelectedRecordingForPlayback(rec);
                            setIsRecordingPlaying(true);
                          }}
                          title={`Click to preview ${rec.cameraName} recording`}
                        >
                          <img
                            src={rec.thumbnail}
                            alt={rec.cameraName}
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="flashback-preview-icon-overlay">
                            <Video size={16} />
                          </div>
                        </button>
                      </td>

                      {/* Created Timestamp */}
                      <td>
                        <div className="flashback-timestamp-group">
                          <span className="flashback-date-text">{rec.createdDate}</span>
                          <span className="flashback-time-text">{rec.createdTime}</span>
                        </div>
                      </td>

                      {/* Completed Timestamp */}
                      <td>
                        <div className="flashback-timestamp-group">
                          <span className="flashback-date-text">{rec.completedDate}</span>
                          <span className="flashback-time-text">{rec.completedTime}</span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td>
                        <span className="flashback-duration-text">{rec.duration}</span>
                      </td>

                      {/* Action: Circular Play Button */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="flashback-play-btn"
                          onClick={() => {
                            setSelectedRecordingForPlayback(rec);
                            setIsRecordingPlaying(true);
                          }}
                          title="Play recording playback"
                          aria-label={`Play recording from ${rec.createdTime}`}
                        >
                          <Play size={13} fill="currentColor" style={{ marginLeft: '2px' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedRecordings.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                        No recording history found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flashback-pagination-footer">
              <div className="flashback-pagination-selector-group">
                <RowsPerPageSelector
                  value={historyRowsPerPage}
                  onChange={(val) => {
                    setHistoryRowsPerPage(val);
                    setHistoryPage(1);
                  }}
                  options={[10, 20, 50, 100]}
                />
              </div>

              <span className="flashback-pagination-info">
                {startEntry}–{endEntry} of {totalHistoryCount}
              </span>

              <div className="flashback-pagination-controls">
                <button
                  type="button"
                  className="flashback-page-nav-btn"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage <= 1}
                  title="Previous Page"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="flashback-page-nav-btn"
                  onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                  disabled={historyPage >= totalPages}
                  title="Next Page"
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Menu Popover */}
        {activeMenu && (
          <div
            className="camera-actions-popover"
            style={{ top: `${activeMenu.top}px`, left: `${activeMenu.left}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="camera-action-item"
              onClick={() => {
                const cam = effectiveCameras.find(c => c.id === activeMenu.id);
                if (cam) setSelectedCameraForStream(cam);
                setActiveMenu(null);
              }}
            >
              <Eye size={15} />
              <span>View</span>
            </button>
            <button
              className="camera-action-item"
              onClick={() => {
                setIsSettingsOpen(true);
                setActiveMenu(null);
              }}
            >
              <Settings size={15} />
              <span>Edit</span>
            </button>
            <button
              className="camera-action-item danger"
              onClick={() => handleDeleteCamera(activeMenu.id)}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* Live Stream Player Modal */}
        {selectedCameraForStream && (
          <Modal
            isOpen={Boolean(selectedCameraForStream)}
            onClose={() => setSelectedCameraForStream(null)}
            title={`Optical Live Feed: ${selectedCameraForStream.name}`}
            maxWidth="680px"
            footer={
              <button className="figma-btn-save" onClick={() => setSelectedCameraForStream(null)}>
                Close Feed
              </button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  height: '360px',
                  borderRadius: '10px',
                  background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #030712 100%)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                  <div className="camera-stream-badge live">
                    <span className="camera-stream-dot" />
                    <span>BROADCASTING • {selectedCameraForStream.resolution}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <Radio size={48} style={{ color: '#10b981', marginBottom: '12px', animation: 'pulse 2s infinite' }} />
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>Optical Stream Transmitting</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '4px' }}>
                    Codec: H.265 • Bitrate: 6.2 Mbps • FPS: {selectedCameraForStream.fps}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                <span>Camera ID: {selectedCameraForStream.id}</span>
                <span>Type: {selectedCameraForStream.type}</span>
                <span>Storage: {selectedCameraForStream.storage}</span>
                <span>Location: {selectedCameraForStream.location}</span>
              </div>
            </div>
          </Modal>
        )}

        {/* Camera Grid Settings Modal */}
        {isSettingsOpen && (
          <Modal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            title="Live Grid & Surveillance Settings"
            maxWidth="520px"
            footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
                <button type="button" className="figma-btn-cancel" onClick={() => setIsSettingsOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="figma-btn-save" onClick={() => setIsSettingsOpen(false)}>
                  Save Settings
                </button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="figma-label">Default Grid View</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {(['1x1', '2x2', '3x3', '4x4'] as const).map(l => (
                    <button
                      key={l}
                      type="button"
                      className={`figma-btn-cancel ${gridLayout === l ? 'active' : ''}`}
                      onClick={() => setGridLayout(l)}
                      style={{
                        padding: '6px 14px',
                        background: gridLayout === l ? 'var(--primary)' : undefined,
                        color: gridLayout === l ? '#fff' : undefined
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="figma-label">Auto-Refresh Interval</label>
                <div style={{ marginTop: '6px' }}>
                  <CustomSmoothDropdown
                    label="Refresh Rate"
                    value="realtime"
                    onChange={() => { }}
                    options={[
                      { label: 'Real-time WebSocket (Low Latency)', value: 'realtime' },
                      { label: 'Every 5 seconds', value: '5s' },
                      { label: 'Every 15 seconds', value: '15s' }
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="figma-label">Stream Quality Mode</label>
                <div style={{ marginTop: '6px' }}>
                  <CustomSmoothDropdown
                    label="Quality Mode"
                    value="adaptive"
                    onChange={() => { }}
                    options={[
                      { label: 'Adaptive Bitrate (Recommended)', value: 'adaptive' },
                      { label: 'Force 4K UHD Original', value: '4k' },
                      { label: 'Bandwidth Saver (720p)', value: '720p' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* INTERACTIVE RECORDING PLAYBACK MODAL */}
        {selectedRecordingForPlayback && (
          <Modal
            isOpen={Boolean(selectedRecordingForPlayback)}
            onClose={() => setSelectedRecordingForPlayback(null)}
            title={`Recording Playback • ${selectedRecordingForPlayback.cameraName} (${selectedRecordingForPlayback.location})`}
            maxWidth="880px"
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedRecordingForPlayback.resolution} • {selectedRecordingForPlayback.size} • Codec: H.265
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="figma-btn-save"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
                    onClick={() => {
                      alert(`Exporting high-resolution archive segment for ${selectedRecordingForPlayback.cameraName}...`);
                    }}
                  >
                    <Download size={14} /> Download MP4
                  </button>
                  <button
                    type="button"
                    className="figma-btn-cancel"
                    onClick={() => setSelectedRecordingForPlayback(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="flashback-modal-video-container">
                {/* OSD Header Overlay */}
                <div className="flashback-modal-osd-header">
                  <div className="flashback-modal-osd-badge">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    <span>REC PLAYBACK • {selectedRecordingForPlayback.cameraName}</span>
                  </div>
                  <div className="flashback-modal-osd-badge">
                    <span>{selectedRecordingForPlayback.createdDate} {selectedRecordingForPlayback.createdTime}</span>
                  </div>
                </div>

                {/* Video Feed */}
                <video
                  src="/assets/video.mp4"
                  poster={selectedRecordingForPlayback.thumbnail}
                  controls={false}
                  autoPlay={isRecordingPlaying}
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Bottom Media Controls Overlay */}
                <div className="flashback-modal-bottom-controls">
                  <button
                    type="button"
                    className="flashback-modal-play-toggle"
                    onClick={() => setIsRecordingPlaying(!isRecordingPlaying)}
                    title={isRecordingPlaying ? 'Pause' : 'Play'}
                  >
                    {isRecordingPlaying ? <Pause size={14} fill="#fff" /> : <Play size={14} fill="#fff" />}
                  </button>

                  <div
                    className="flashback-modal-progress-bar"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
                      setPlaybackProgress(percent);
                    }}
                  >
                    <div className="flashback-modal-progress-fill" style={{ width: `${playbackProgress}%` }} />
                  </div>

                  <span style={{ fontSize: '11px', color: '#cbd5e1', fontFamily: 'monospace' }}>
                    00:0{Math.floor((playbackProgress / 100) * parseInt(selectedRecordingForPlayback.duration, 10))} / 00:{selectedRecordingForPlayback.duration.padStart(2, '0')}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--nested-bg, color-mix(in srgb, var(--text-main) 3%, transparent))',
                border: '1px solid var(--border-light, #e2e8f0)',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Camera ID: </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedRecordingForPlayback.cameraId}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Location: </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedRecordingForPlayback.location}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Created: </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedRecordingForPlayback.createdTime}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Completed: </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedRecordingForPlayback.completedTime}</span>
                </div>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
}
