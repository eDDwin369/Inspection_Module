import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
  Video,
  VideoOff,
  Camera,
  Radio,
  Eye,
  Settings,
  Trash2,
  Play,
  Pause,
  ChevronDown,
  Tv,
  ArrowLeftRight,
  Bell,
  Maximize,
  Minimize,
  Info,
  Sun,
  Target,
  Check,
  CheckCircle2,
  SlidersHorizontal,
  Menu,
  LayoutGrid,
  Calendar
} from 'lucide-react';
import { Card } from '../shared/Card';
import { PageHeader } from '../shared/PageHeader';
import { SearchField } from '../shared/SearchField';
import { CustomSmoothDropdown } from '../shared/CustomSmoothDropdown';
import { Modal } from '../shared/Modal';
import '../AccountSettings/AccountSettings.css';
import '../shared/SharedUI.css';

export interface CameraItem {
  id: string;
  name: string;
  type: '360°' | 'PTZ' | 'Fixed';
  location: 'Indoor' | 'Outdoor';
  zone?: string;
  hasStream: boolean;
  streamText?: string;
  resolution: string;
  fps: number;
  description?: string;
  rtspUrl?: string;
  defaultPan?: number;
  defaultTilt?: number;
  zoomLevel?: string;
}

const INITIAL_CAMERAS: CameraItem[] = [
  {
    id: 'cam-1',
    name: 'Cafeteria Counter',
    type: 'Fixed',
    location: 'Indoor',
    zone: 'Cafeteria & Dining',
    hasStream: false,
    streamText: 'No 360° stream',
    resolution: '1080p FHD',
    fps: 30,
    description: 'Indoor coverage of the cafeteria checkout counter and staff transit line.'
  },
  {
    id: 'cam-2',
    name: 'Chennai Rooftop 360',
    type: '360°',
    location: 'Outdoor',
    zone: 'Rooftop Perimeter',
    hasStream: true,
    resolution: '4K UHD',
    fps: 30,
    description: '',
    rtspUrl: 'rtsp://allcad-chennai.selfip.com:8554/RTMP_CAM23',
    defaultPan: 0,
    defaultTilt: 0,
    zoomLevel: '1x Optical'
  },
  {
    id: 'cam-3',
    name: 'Loading Dock',
    type: 'Fixed',
    location: 'Outdoor',
    zone: 'Logistics Bay North',
    hasStream: false,
    streamText: 'No 360° stream',
    resolution: '1080p FHD',
    fps: 30,
    description: ''
  },
  {
    id: 'cam-4',
    name: 'Main Gate PTZ',
    type: 'PTZ',
    location: 'Outdoor',
    zone: 'Main Entrance Gate',
    hasStream: false,
    streamText: 'No 360° stream',
    resolution: '4K UHD',
    fps: 60,
    description: 'Primary vehicular entry and security turnstile pan-tilt tracking node.'
  },
  {
    id: 'cam-5',
    name: 'Perimeter East',
    type: 'Fixed',
    location: 'Outdoor',
    zone: 'East Boundary Fence',
    hasStream: false,
    streamText: 'No 360° stream',
    resolution: '1080p FHD',
    fps: 30,
    description: 'Eastern facility boundary surveillance fence and intrusion monitoring.'
  },
  {
    id: 'cam-6',
    name: 'Server Room',
    type: 'Fixed',
    location: 'Indoor',
    zone: 'Data Center Vault',
    hasStream: false,
    streamText: 'No 360° stream',
    resolution: '4K UHD',
    fps: 60,
    description: 'High-security data center and server vault biometric entrance.'
  },
  {
    id: 'cam-7',
    name: 'Street PTZ',
    type: 'PTZ',
    location: 'Outdoor',
    zone: 'West Crossroad',
    hasStream: true,
    resolution: '4K UHD',
    fps: 30,
    description: 'Street-facing PTZ camera with active highway license plate optical tracking.'
  },
  {
    id: 'cam-8',
    name: 'Warehouse Aisle',
    type: 'Fixed',
    location: 'Indoor',
    zone: 'Central Warehouse',
    hasStream: false,
    streamText: 'No 360° stream',
    resolution: '1080p FHD',
    fps: 30,
    description: 'Aisle B3 high-bay pallet racking and forklift operations surveillance.'
  }
];

const CAMERA_OPTIONS = [
  { label: 'All Cameras', value: 'all' },
  { label: 'Cafeteria Counter', value: 'Cafeteria Counter' },
  { label: 'Chennai Rooftop 360', value: 'Chennai Rooftop 360' },
  { label: 'Loading Dock', value: 'Loading Dock' },
  { label: 'Main Gate PTZ', value: 'Main Gate PTZ' },
  { label: 'Perimeter East', value: 'Perimeter East' },
  { label: 'Server Room', value: 'Server Room' },
  { label: 'Street PTZ', value: 'Street PTZ' },
  { label: 'Warehouse Aisle', value: 'Warehouse Aisle' }
];

export interface OomniWatchPageProps {
  onNavigate?: (view: string, options?: any) => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function OomniWatchPage({
  onNavigate: _onNavigate,
  title,
  subtitle,
  icon
}: OomniWatchPageProps = {}) {
  const [cameras, setCameras] = useState<CameraItem[]>(INITIAL_CAMERAS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal states for View, Edit, and Delete (Matching Reference Images 1, 2, 3)
  const [viewCamera, setViewCamera] = useState<CameraItem | null>(null);
  const [viewTab, setViewTab] = useState<'basic' | 'config' | 'ptz'>('basic');

  const [editCamera, setEditCamera] = useState<CameraItem | null>(null);
  const [editStep, setEditStep] = useState<1 | 2 | 3>(1);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState<'360°' | 'PTZ' | 'Fixed'>('Fixed');
  const [editLocation, setEditLocation] = useState<'Indoor' | 'Outdoor'>('Outdoor');
  const [editResolution, setEditResolution] = useState('1080p FHD');
  const [editFps, setEditFps] = useState(30);
  const [editPan, setEditPan] = useState(0);
  const [editTilt, setEditTilt] = useState(0);

  const [deleteCamera, setDeleteCamera] = useState<CameraItem | null>(null);

  const handleConfirmDelete = () => {
    if (deleteCamera) {
      setCameras(prev => prev.filter(c => c.id !== deleteCamera.id));
      if (selectedCameraForModal?.id === deleteCamera.id) {
        setSelectedCameraForModal(null);
      }
      setDeleteCamera(null);
    }
  };

  const handleSaveEdit = () => {
    if (!editCamera) return;
    setCameras(prev => prev.map(c => {
      if (c.id === editCamera.id) {
        return {
          ...c,
          name: editName.trim() || c.name,
          description: editDescription.trim(),
          type: editType,
          location: editLocation,
          resolution: editResolution,
          fps: editFps,
          defaultPan: editPan,
          defaultTilt: editTilt
        };
      }
      return c;
    }));
    setEditCamera(null);
  };

  // Action Menu Portal State
  const [activeMenu, setActiveMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [selectedCameraForModal, setSelectedCameraForModal] = useState<CameraItem | null>(null);
  const [modalMode, setModalMode] = useState<'stream' | 'details' | null>(null);

  // Live View Modal Enhanced State (Matching Reference Screenshot)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [projectionMode, setProjectionMode] = useState<'flat' | '360'>('360');
  const [isCameraDropdownOpen, setIsCameraDropdownOpen] = useState<boolean>(false);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 50, y: 78 });
  const [ptzCoords, setPtzCoords] = useState<{ pan: number; tilt: number }>({ pan: 0, tilt: 0 });
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);
  const [isSubStream, setIsSubStream] = useState<boolean>(false);

  // Live View Settings Panel & PTZ Calibration State (Matching Reference Screenshot)
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState<boolean>(false);
  const [previewCalibration, setPreviewCalibration] = useState<number>(10);
  const [ptzClickBuffer, setPtzClickBuffer] = useState<number>(20);
  const [isWebRTC, setIsWebRTC] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isPtzVideoVisible, setIsPtzVideoVisible] = useState<boolean>(true);
  const ptzVideoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ptzVideoRef.current) {
      if (isPlaying) {
        ptzVideoRef.current.play().catch(() => {});
      } else {
        ptzVideoRef.current.pause();
      }
    }
  }, [isPlaying]);
  const settingsPanelRef = React.useRef<HTMLDivElement>(null);
  const threeDotBtnRef = React.useRef<HTMLButtonElement>(null);

  // Close Settings panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        isSettingsPanelOpen &&
        settingsPanelRef.current &&
        !settingsPanelRef.current.contains(target) &&
        threeDotBtnRef.current &&
        !threeDotBtnRef.current.contains(target)
      ) {
        setIsSettingsPanelOpen(false);
      }
    };

    if (isSettingsPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsPanelOpen]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const liveviewViewportRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !isFullscreen) {
      if (liveviewViewportRef.current?.requestFullscreen) {
        liveviewViewportRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleCloseLiveModal = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
    setIsSettingsPanelOpen(false);
    setSelectedCameraForModal(null);
    setIsCameraDropdownOpen(false);
  };

  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setTargetPos({ x: xPct, y: yPct });
    setPtzCoords({
      pan: Math.round((xPct - 50) * 3.6),
      tilt: Math.round((yPct - 50) * 1.8)
    });
  };

  // Filter cameras based on search query and camera filter
  const filteredCameras = useMemo(() => {
    return cameras.filter(cam => {
      // Search matching
      const matchesSearch = !searchQuery.trim() ||
        cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cam.zone && cam.zone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        cam.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Camera filter matching
      const matchesCamera = filterType === 'all' || cam.name.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesCamera;
    });
  }, [cameras, searchQuery, filterType]);

  // Close action menu on click outside or scroll
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

  return (
    <div className="figma-account-settings-page-wrapper" style={{ paddingBottom: '24px' }}>
      <div className="figma-account-settings-container">
        {/* Page Header conforming to Account Settings */}
        <PageHeader
          title={title || "Cameras"}
          subtitle={subtitle}
          icon={icon || <Camera size={20} />}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            </div>
          }
        />

        {/* Omni Watch Toolbar: ONLY Search Bar & All Cameras Dropdown */}
        <div
          className="vision-toolbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px'
          }}
        >
          <div className="vision-toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* 1. Search Bar */}
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search camera..."
            />

            {/* 2. All Cameras Dropdown */}
            <div style={{ minWidth: '150px' }}>
              <CustomSmoothDropdown
                label="All Cameras"
                value={filterType}
                onChange={(val) => setFilterType(val)}
                options={CAMERA_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* Camera Cards Grid */}
        {filteredCameras.length > 0 ? (
            <div className="camera-grid">
              {filteredCameras.map((cam) => (
                <Card
                  key={cam.id}
                  className="camera-card"
                  onClick={() => {
                    setSelectedCameraForModal(cam);
                    setModalMode('stream');
                  }}
                >
                  {/* Camera Preview Area */}
                  <div className={`camera-preview-box ${cam.hasStream ? 'is-live' : 'is-offline'}`}>
                    {/* Subtle Vignette Gradient Overlay */}
                    <div className="camera-preview-overlay" />

                    {/* Status Badge */}
                    <div className={`camera-stream-badge ${cam.hasStream ? 'live' : 'offline'}`}>
                      <span className="camera-stream-dot" />
                      <span>{cam.hasStream ? 'LIVE' : 'OFFLINE'}</span>
                    </div>

                    {/* Camera Profile Badge (Right Top) */}
                    <div className="camera-type-badge">
                      {cam.type}
                    </div>

                    {/* Center Content Placeholder */}
                    {cam.hasStream ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        zIndex: 1
                      }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'color-mix(in srgb, var(--primary) 18%, transparent)',
                          border: '1.5px solid var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          boxShadow: '0 0 16px color-mix(in srgb, var(--primary) 25%, transparent)'
                        }}>
                          <Video size={20} style={{ color: 'var(--primary)' }} />
                        </div>
                        <span style={{ fontSize: '11.5px', color: 'color-mix(in srgb, var(--primary) 85%, white)', fontWeight: 600, letterSpacing: '0.3px' }}>
                          {cam.resolution} • {cam.fps} FPS
                        </span>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--text-muted)',
                        zIndex: 1
                      }}>
                        <Camera size={34} style={{ opacity: 0.35, strokeWidth: 1.5 }} />
                        <span style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.2px' }}>
                          {cam.streamText || 'No 360° stream'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Info Section */}
                  <div className="camera-card-info">
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                      <div className="camera-name-text" title={cam.name}>
                        {cam.name}
                      </div>
                      <div className="camera-sub-text">
                        <span>{cam.location}</span>
                        <span>•</span>
                        <span>{cam.type}</span>
                      </div>
                    </div>

                    <button
                      className="camera-menu-btn"
                      title="Camera options"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMenu(cam.id, e);
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
        ) : (
          <Card style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'color-mix(in srgb, var(--text-main) 6%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              marginBottom: '16px'
            }}>
              <Camera size={24} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              No cameras found
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px', marginBottom: '20px' }}>
              No cameras matched your search query "{searchQuery}". Try searching with a different name or clearing filters.
            </div>
            <button
              className="figma-btn-cancel"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
            >
              Reset Filters
            </button>
          </Card>
        )}
      </div>

      {/* Floating Action Menu Portal */}
      {activeMenu &&
        createPortal(
          <div
            className="camera-actions-popover"
            style={{
              top: activeMenu.top,
              left: activeMenu.left
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const cam = cameras.find(c => c.id === activeMenu.id);
              if (!cam) return null;
              return (
                <>
                  <button
                    type="button"
                    className="camera-action-item"
                    onClick={() => {
                      setViewCamera(cam);
                      setViewTab('basic');
                      setActiveMenu(null);
                    }}
                  >
                    <Eye size={15} style={{ color: 'var(--primary)' }} />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    className="camera-action-item"
                    onClick={() => {
                      setEditCamera(cam);
                      setEditStep(1);
                      setEditName(cam.name);
                      setEditDescription(cam.description || '');
                      setEditType(cam.type);
                      setEditLocation(cam.location);
                      setEditResolution(cam.resolution);
                      setEditFps(cam.fps);
                      setEditPan(cam.defaultPan || 0);
                      setEditTilt(cam.defaultTilt || 0);
                      setActiveMenu(null);
                    }}
                  >
                    <Settings size={15} style={{ color: 'var(--text-muted)' }} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    className="camera-action-item danger"
                    onClick={() => {
                      setDeleteCamera(cam);
                      setActiveMenu(null);
                    }}
                  >
                    <Trash2 size={15} style={{ color: 'var(--danger, #ef4444)' }} />
                    <span>Delete</span>
                  </button>
                </>
              );
            })()}
          </div>,
          document.body
        )}

      {/* Camera Live Stream / Detail Modal (Matching User Reference Image) */}
      {selectedCameraForModal && (
        <Modal
          isOpen={Boolean(selectedCameraForModal)}
          onClose={handleCloseLiveModal}
          icon={<Video size={18} />}
          title={modalMode === 'stream' ? selectedCameraForModal.name : `Node Info: ${selectedCameraForModal.name}`}
          subtitle={
            modalMode === 'stream' ? (
              <>Live 360° Stream & PTZ Controls · <span style={{ color: '#16a34a', fontWeight: 600 }}>Active</span></>
            ) : (
              <>Hardware & Edge Configuration</>
            )
          }
          maxWidth={modalMode === 'stream' ? (isFullscreen ? "100vw" : "980px") : "640px"}
          className={isFullscreen ? "liveview-modal-fullscreen" : ""}
        >
          {modalMode === 'stream' ? (
            <div className={`liveview-card ${isFullscreen ? 'is-fullscreen' : ''}`}>

              {/* Panoramic Viewport Area */}
              <div
                ref={liveviewViewportRef}
                className={`liveview-viewport ${isFullscreen ? 'is-fullscreen' : ''}`}
                onClick={handleViewportClick}
              >
                {/* Simulated / Real Camera Live Feed */}
                <img
                  src={selectedCameraForModal.name === 'Chennai Rooftop 360' ? '/images/chennai-rooftop-360.png' : (
                    selectedCameraForModal.hasStream
                      ? '/images/chennai-rooftop-360.png'
                      : '/images/live-digital-twin.png'
                  )}
                  alt={selectedCameraForModal.name}
                  className={`liveview-feed-img ${projectionMode === '360' ? 'panoramic' : 'flat'}`}
                  style={{
                    filter: isPlaying ? 'none' : 'grayscale(35%) brightness(0.85)',
                    transform: projectionMode === '360' ? 'scale(1.06)' : 'none'
                  }}
                />

                {/* Vignette Overlay */}
                <div className="camera-preview-overlay" />

                {/* Top-Left PTZ Status Card with Dummy Video Feed and Dynamic Scaling */}
                <div 
                  className="liveview-ptz-badge"
                  style={{
                    transform: `scale(${previewCalibration / 10})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Dummy Video Feed for PTZ Card */}
                  {isPtzVideoVisible ? (
                    <video
                      ref={ptzVideoRef}
                      src="/assets/video.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="liveview-ptz-video"
                    />
                  ) : (
                    <div className="liveview-ptz-video" style={{ background: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <VideoOff size={22} style={{ opacity: 0.4 }} />
                    </div>
                  )}

                  {/* Gradient Overlay for Text Contrast */}
                  <div className="liveview-ptz-overlay" />

                  {/* Header: 360° badge on left, video icon on right (Matching User Reference Image 2) */}
                  <div className="liveview-ptz-header">
                    <span className="liveview-ptz-360-badge">360°</span>
                    <button
                      type="button"
                      className="liveview-ptz-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPtzVideoVisible(prev => !prev);
                      }}
                      title={isPtzVideoVisible ? "Hide PTZ Video Feed" : "Show PTZ Video Feed"}
                    >
                      {isPtzVideoVisible ? <Video size={14} /> : <VideoOff size={14} />}
                    </button>
                  </div>

                  {/* Footer: PTZ Status & Coordinates (Matching User Reference Image 1) */}
                  <div className="liveview-ptz-footer">
                    <div className="liveview-ptz-badge-title">
                      <span>PTZ</span>
                      <span className="liveview-ptz-badge-indicator" />
                      {isCalibrating && (
                        <span style={{ fontSize: '9px', color: '#10b981', marginLeft: '4px', fontWeight: 600 }}>CALIBRATED</span>
                      )}
                    </div>
                    <div className="liveview-ptz-badge-coords">
                      Pan: {ptzCoords.pan}° &nbsp;Tilt: {ptzCoords.tilt}°
                    </div>
                  </div>
                </div>

                {/* Top-Right Floating Control Bar (Glassmorphism) */}
                <div
                  className="liveview-controls-bar"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Camera Name Selector Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className="liveview-camera-select-trigger"
                      onClick={() => setIsCameraDropdownOpen(prev => !prev)}
                      title="Switch Camera Node"
                    >
                      <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedCameraForModal.name}
                      </span>
                      <ChevronDown size={14} style={{ transform: isCameraDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                    </button>

                    {isCameraDropdownOpen && (
                      <div className="liveview-camera-dropdown">
                        {cameras.map(cam => (
                          <button
                            key={cam.id}
                            type="button"
                            className={`liveview-camera-item ${cam.id === selectedCameraForModal.id ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedCameraForModal(cam);
                              setIsCameraDropdownOpen(false);
                            }}
                          >
                            <Video size={14} />
                            <span>{cam.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.2)' }} />

                  {/* Flat / 360 View Mode Toggle */}
                  <div
                    className={`liveview-projection-toggle ${projectionMode === '360' ? 'is-360' : 'is-flat'}`}
                    onClick={() => setProjectionMode(prev => prev === '360' ? 'flat' : '360')}
                    title="Toggle Panoramic Projection Mode"
                  >
                    <span style={{ opacity: projectionMode === 'flat' ? 1 : 0.6, fontWeight: projectionMode === 'flat' ? 700 : 500 }}>
                      Flat
                    </span>
                    <span className="liveview-toggle-knob" />
                    <span style={{ opacity: projectionMode === '360' ? 1 : 0.6, fontWeight: projectionMode === '360' ? 700 : 500 }}>
                      360°
                    </span>
                  </div>

                  {/* Picture-in-Picture / Multi-feed button */}
                  <button
                    type="button"
                    className="liveview-icon-btn"
                    onClick={() => alert(`Picture-in-picture mode initiated for ${selectedCameraForModal.name}`)}
                    title="Picture in Picture"
                  >
                    <Tv size={16} />
                  </button>

                  {/* Switch Stream / Secondary stream */}
                  <button
                    type="button"
                    className="liveview-icon-btn"
                    onClick={() => setIsSubStream(prev => !prev)}
                    title={isSubStream ? "Switch to 360° Main Stream" : "Switch to PTZ Sub-Stream"}
                    style={{ color: isSubStream ? '#3b82f6' : 'rgba(255, 255, 255, 0.85)' }}
                  >
                    <ArrowLeftRight size={16} />
                  </button>

                  {/* Alert notification bell */}
                  <button
                    type="button"
                    className="liveview-icon-btn"
                    onClick={() => setIsAlertActive(prev => !prev)}
                    title={isAlertActive ? "Mute Camera Alerts" : "Camera Alert Monitoring Active"}
                    style={{ color: isAlertActive ? '#ef4444' : 'rgba(255, 255, 255, 0.85)' }}
                  >
                    <Bell size={16} />
                    {isAlertActive && (
                      <span style={{ position: 'absolute', top: '5px', right: '5px', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                    )}
                  </button>

                  {/* Stream Settings / More options with Settings Panel (Matching User Reference Image 1) */}
                  <div style={{ position: 'relative' }}>
                    <button
                      ref={threeDotBtnRef}
                      type="button"
                      className={`liveview-icon-btn ${isSettingsPanelOpen ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSettingsPanelOpen(prev => !prev);
                      }}
                      title="Preview Settings"
                      style={{
                        background: isSettingsPanelOpen ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        color: isSettingsPanelOpen ? '#3b82f6' : 'rgba(255, 255, 255, 0.85)'
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Settings Panel Popup */}
                    {isSettingsPanelOpen && (
                      <div
                        ref={settingsPanelRef}
                        className="liveview-settings-panel"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 1. Preview Size Calibration */}
                        <div className="liveview-settings-section">
                          <div className="liveview-settings-label">
                            Preview Size Calibration ({previewCalibration}% of main)
                          </div>
                          <div className="liveview-slider-wrapper">
                            <input
                              type="range"
                              min={5}
                              max={40}
                              value={previewCalibration}
                              onChange={(e) => setPreviewCalibration(Number(e.target.value))}
                              className="liveview-range-slider"
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((previewCalibration - 5) / (40 - 5)) * 100}%, rgba(255, 255, 255, 0.25) ${((previewCalibration - 5) / (40 - 5)) * 100}%, rgba(255, 255, 255, 0.25) 100%)`
                              }}
                            />
                          </div>
                          <div className="liveview-settings-desc">
                            Main preview keeps the remaining {100 - previewCalibration}%. Sizes adapt automatically to browser, resolution, and fullscreen.
                          </div>
                        </div>

                        {/* 2. PTZ Click Buffer */}
                        <div className="liveview-settings-section">
                          <div className="liveview-settings-label">
                            PTZ click buffer (max 20)
                          </div>
                          <div className="liveview-slider-wrapper">
                            <input
                              type="range"
                              min={1}
                              max={20}
                              value={ptzClickBuffer}
                              onChange={(e) => setPtzClickBuffer(Number(e.target.value))}
                              className="liveview-range-slider"
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((ptzClickBuffer - 1) / (20 - 1)) * 100}%, rgba(255, 255, 255, 0.25) ${((ptzClickBuffer - 1) / (20 - 1)) * 100}%, rgba(255, 255, 255, 0.25) 100%)`
                              }}
                            />
                          </div>
                          <div className="liveview-settings-desc">
                            How many clicks each PTZ movement button can buffer while the camera is moving.
                          </div>
                        </div>

                        {/* 3. Switch to WebRTC */}
                        <div className="liveview-settings-row">
                          <div className="liveview-settings-row-left">
                            <span>Switch to WebRTC</span>
                            <span 
                              className="liveview-settings-info-badge"
                              title="Low-latency WebRTC direct stream connection (<200ms latency)"
                            >
                              <Info size={11} />
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`liveview-settings-action-btn ${isWebRTC ? 'active' : ''}`}
                            onClick={() => setIsWebRTC(prev => !prev)}
                            title={isWebRTC ? "Switch back to standard RTSP stream" : "Switch to ultra-low-latency WebRTC stream"}
                          >
                            <Sun size={17} />
                          </button>
                        </div>

                        {/* 4. Calibrate 360° -> PTZ */}
                        <div className="liveview-settings-row">
                          <div className="liveview-settings-row-left">
                            <span>Calibrate 360° → PTZ</span>
                          </div>
                          <button
                            type="button"
                            className="liveview-settings-action-btn"
                            onClick={() => {
                              setIsCalibrating(true);
                              setPtzCoords({ pan: 0, tilt: 0 });
                              setTargetPos({ x: 50, y: 78 });
                              setTimeout(() => setIsCalibrating(false), 1500);
                            }}
                            title="Calibrate 360 panoramic mapping to PTZ center"
                          >
                            <Target size={17} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fullscreen button */}
                  <button
                    type="button"
                    className="liveview-icon-btn"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
                  >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  </button>
                </div>

                {/* Center Bottom Play / Pause Button */}
                <button
                  type="button"
                  className="liveview-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(prev => !prev);
                  }}
                  title={isPlaying ? "Pause Stream" : "Play Stream"}
                >
                  {isPlaying ? (
                    <Pause size={20} fill="currentColor" />
                  ) : (
                    <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
                  )}
                </button>

                {/* Interactive Blue PTZ Focal Target Ring on Ground */}
                <div
                  className="liveview-focal-target"
                  style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
                >
                  <span className="liveview-focal-dot" />
                </div>

              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                Hardware model configuration, RTSP edge endpoint settings, and analytics triggers for <strong>{selectedCameraForModal.name}</strong>.
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--nested-bg)', border: '1px solid var(--border-light)', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                rtsp://stream.oomniwatch.internal:554/live/{selectedCameraForModal.id}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* 1. View Camera Modal (Matching Reference Image 3 & Card UI Standard Image 4) */}
      {viewCamera && (
        <Modal
          isOpen={Boolean(viewCamera)}
          onClose={() => setViewCamera(null)}
          maxWidth="560px"
          icon={<Eye size={18} />}
          title={<span style={{ color: '#ea580c', fontWeight: 700, fontSize: '18px' }}>View Camera</span>}
          subtitle={<>Read-only camera details</>}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                className="camera-btn-primary-blue"
                onClick={() => setViewCamera(null)}
              >
                Close
              </button>
            </div>
          }
        >
          <div>
            {/* Modal Internal Tabs (Basic | Configuration | PTZ Calibration) */}
            <div className="modal-tabs-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={viewTab === 'basic'}
                className={`modal-tab-btn ${viewTab === 'basic' ? 'active' : ''}`}
                onClick={() => setViewTab('basic')}
              >
                <span className="modal-tab-icon-badge">
                  <Info size={16} />
                </span>
                <span>Basic</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewTab === 'config'}
                className={`modal-tab-btn ${viewTab === 'config' ? 'active' : ''}`}
                onClick={() => setViewTab('config')}
              >
                <span className="modal-tab-icon-badge">
                  <Settings size={16} />
                </span>
                <span>Configuration</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewTab === 'ptz'}
                className={`modal-tab-btn ${viewTab === 'ptz' ? 'active' : ''}`}
                onClick={() => setViewTab('ptz')}
              >
                <span className="modal-tab-icon-badge">
                  <SlidersHorizontal size={16} />
                </span>
                <span>PTZ Calibration</span>
              </button>
            </div>

            {/* Tab 1: Basic Camera Details */}
            {viewTab === 'basic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div className="camera-modal-label">Camera name</div>
                  <div className="camera-modal-readvalue">{viewCamera.name}</div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <div className="camera-modal-label">Description</div>
                  <div className="camera-modal-readvalue" style={{ fontWeight: 400, color: viewCamera.description ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {viewCamera.description || '—'}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Hardware Configuration */}
            {viewTab === 'config' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                <div>
                  <div className="camera-modal-label">Camera Type</div>
                  <div className="camera-modal-readvalue">{viewCamera.type}</div>
                </div>
                <div>
                  <div className="camera-modal-label">Location</div>
                  <div className="camera-modal-readvalue">{viewCamera.location}</div>
                </div>
                <div>
                  <div className="camera-modal-label">Stream Status</div>
                  <div className="camera-modal-readvalue" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                    {viewCamera.hasStream ? 'Online & Streaming' : 'Standby'}
                  </div>
                </div>
                <div>
                  <div className="camera-modal-label">Resolution & FPS</div>
                  <div className="camera-modal-readvalue">{viewCamera.resolution} • {viewCamera.fps} FPS</div>
                </div>
                <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                  <div className="camera-modal-label">RTSP Stream URL</div>
                  <div style={{ fontSize: '12.5px', fontFamily: 'monospace', padding: '10px 12px', background: 'var(--nested-bg)', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', marginTop: '4px', wordBreak: 'break-all' }}>
                    {viewCamera.rtspUrl || `rtsp://edge-01.omnieye.internal:554/live/${viewCamera.id}`}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: PTZ Calibration */}
            {viewTab === 'ptz' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                  <div>
                    <div className="camera-modal-label">Pan Range</div>
                    <div className="camera-modal-readvalue">-180° to +180° (Default: {viewCamera.defaultPan || 0}°)</div>
                  </div>
                  <div>
                    <div className="camera-modal-label">Tilt Range</div>
                    <div className="camera-modal-readvalue">-90° to +90° (Default: {viewCamera.defaultTilt || 0}°)</div>
                  </div>
                  <div>
                    <div className="camera-modal-label">Zoom Range</div>
                    <div className="camera-modal-readvalue">1.0x to 10.0x (Default: {viewCamera.zoomLevel || 1.0}x)</div>
                  </div>
                  <div>
                    <div className="camera-modal-label">Calibration Status</div>
                    <div className="camera-modal-readvalue" style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> Calibrated & Centered
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '8px', padding: '14px', background: 'color-mix(in srgb, var(--primary) 8%, transparent)', borderRadius: '12px', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>Live PTZ Controller Ready</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Calibrated against optical center point.</div>
                  </div>
                  <button
                    type="button"
                    className="camera-btn-cancel-blue"
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                    onClick={() => {
                      const target = viewCamera;
                      setViewCamera(null);
                      setSelectedCameraForModal(target);
                      setModalMode('stream');
                    }}
                  >
                    Open Live PTZ Feed
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 2. Edit Camera Modal (Matching Reference Image 2 & Card UI Standard Image 4) */}
      {editCamera && (
        <Modal
          isOpen={Boolean(editCamera)}
          onClose={() => setEditCamera(null)}
          maxWidth="560px"
          icon={<Settings size={18} />}
          title={<span style={{ color: '#ea580c', fontWeight: 700, fontSize: '18px' }}>Edit Camera</span>}
          subtitle={
            <>
              Step {editStep} of 3 · {editStep === 1 ? 'Basic Camera Details' : editStep === 2 ? 'Configuration' : 'PTZ Calibration'}
            </>
          }
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <button
                type="button"
                className="camera-btn-outline-back"
                disabled={editStep === 1}
                onClick={() => setEditStep(prev => (prev > 1 ? ((prev - 1) as any) : 1))}
              >
                Back
              </button>
              <button
                type="button"
                className="camera-btn-primary-blue"
                onClick={() => {
                  if (editStep < 3) {
                    setEditStep(prev => ((prev + 1) as any));
                  } else {
                    handleSaveEdit();
                  }
                }}
              >
                {editStep < 3 ? 'Next' : 'Save Changes'}
              </button>
            </div>
          }
        >
          <div>
            {/* Step 1: Basic Camera Details */}
            {editStep === 1 && (
              <div>
                <div className="camera-modal-field">
                  <label className="camera-modal-label" htmlFor="edit-cam-name">Camera name</label>
                  <input
                    id="edit-cam-name"
                    type="text"
                    className="camera-modal-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Loading Dock"
                  />
                </div>

                <div className="camera-modal-field">
                  <label className="camera-modal-label" htmlFor="edit-cam-desc">Description (optional)</label>
                  <textarea
                    id="edit-cam-desc"
                    className="camera-modal-input"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Short description for this camera"
                  />
                  <div className="camera-modal-hint">Optional note for administrators.</div>
                </div>
              </div>
            )}

            {/* Step 2: Camera Configuration */}
            {editStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="camera-modal-field">
                  <label className="camera-modal-label">Camera Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {(['360°', 'PTZ', 'Fixed'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEditType(type)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: editType === type ? '2px solid #2563eb' : '1px solid var(--border-medium, #d1d5db)',
                          background: editType === type ? 'color-mix(in srgb, #2563eb 8%, transparent)' : 'var(--bg-card)',
                          color: editType === type ? '#2563eb' : 'var(--text-main)',
                          fontWeight: editType === type ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: '13.5px'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="camera-modal-field">
                  <label className="camera-modal-label">Location Profile</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {(['Outdoor', 'Indoor'] as const).map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setEditLocation(loc)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: editLocation === loc ? '2px solid #2563eb' : '1px solid var(--border-medium, #d1d5db)',
                          background: editLocation === loc ? 'color-mix(in srgb, #2563eb 8%, transparent)' : 'var(--bg-card)',
                          color: editLocation === loc ? '#2563eb' : 'var(--text-main)',
                          fontWeight: editLocation === loc ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: '13.5px'
                        }}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="camera-modal-field">
                    <label className="camera-modal-label">Resolution</label>
                    <select
                      className="camera-modal-input"
                      value={editResolution}
                      onChange={(e) => setEditResolution(e.target.value)}
                    >
                      <option value="4K UHD (3840×2160)">4K UHD (3840×2160)</option>
                      <option value="1080p FHD">1080p FHD</option>
                      <option value="720p HD">720p HD</option>
                    </select>
                  </div>
                  <div className="camera-modal-field">
                    <label className="camera-modal-label">Target FPS</label>
                    <select
                      className="camera-modal-input"
                      value={editFps}
                      onChange={(e) => setEditFps(Number(e.target.value))}
                    >
                      <option value={15}>15 FPS (Eco)</option>
                      <option value={24}>24 FPS (Cinema)</option>
                      <option value={30}>30 FPS (Standard)</option>
                      <option value={60}>60 FPS (High Performance)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: PTZ Calibration */}
            {editStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="camera-modal-label">Pan Offset Angle</label>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>{editPan}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={editPan}
                    onChange={(e) => setEditPan(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>-180° Left</span>
                    <span>0° Center</span>
                    <span>+180° Right</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="camera-modal-label">Tilt Offset Angle</label>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>{editTilt}°</span>
                  </div>
                  <input
                    type="range"
                    min={-90}
                    max={90}
                    value={editTilt}
                    onChange={(e) => setEditTilt(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>-90° Down</span>
                    <span>0° Level</span>
                    <span>+90° Up</span>
                  </div>
                </div>

                <div style={{ padding: '12px 16px', background: 'var(--nested-bg)', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Motorized gimbal calibration routine passes optical benchmarks.
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 3. Delete Camera Modal (Matching Reference Image 1 & Card UI Standard Image 4) */}
      {deleteCamera && (
        <Modal
          isOpen={Boolean(deleteCamera)}
          onClose={() => setDeleteCamera(null)}
          maxWidth="480px"
          icon={<Trash2 size={18} color="#dc2626" />}
          title={<span style={{ color: '#dc2626', fontWeight: 700, fontSize: '18px' }}>Delete Camera</span>}
          redCloseBtn={true}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
              <button
                type="button"
                className="camera-btn-cancel-blue"
                onClick={() => setDeleteCamera(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="camera-btn-delete-red"
                onClick={handleConfirmDelete}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          }
        >
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Are you sure you want to delete this camera? This action cannot be undone.
            </div>
            <div className="camera-delete-box">
              <Trash2 size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
              <span className="camera-delete-name">{deleteCamera.name}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

