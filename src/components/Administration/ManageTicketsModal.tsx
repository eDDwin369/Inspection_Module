import React, { useState, useMemo } from 'react';
import { 
  Ticket, 
  Filter, 
  Columns, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ArrowUpDown
} from 'lucide-react';
import { Modal } from '../shared/Modal';
import { SearchField } from '../shared/SearchField';
import { RowsPerPageSelector } from '../shared/RowsPerPageSelector';
import { TicketFilterPopoverCard } from './TicketOptionsPopovers';
import './ManageTicketsModal.css';

export interface TicketItem {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Pending Post-approval' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  nextAction: string;
  assignee: string;
  reporter: string;
  location: string;
  isAssignedToMe?: boolean;
  isReportedByMe?: boolean;
  isRelatedToMe?: boolean;
  isInbox?: boolean;
}

const INITIAL_TICKETS: TicketItem[] = [
  {
    id: 'tkt-1',
    title: 'h',
    status: 'To Do',
    priority: 'Medium',
    nextAction: 'Assign +1',
    assignee: 'cf2db8ae-7b3a-4f35-9ca...',
    reporter: 'da5ddfea-116d-4abe-a0...',
    location: 'Warehouse'
  },
  {
    id: 'tkt-2',
    title: 'Sub-task of: water issue',
    status: 'To Do',
    priority: 'Medium',
    nextAction: 'Reassign +2',
    assignee: 'ff9b2088-d28d-4231-9ae...',
    reporter: 'da5ddfea-116d-4abe-a0...',
    location: 'Construction Site 360'
  },
  {
    id: 'tkt-3',
    title: 'Sub-task of: water issue',
    status: 'To Do',
    priority: 'Medium',
    nextAction: 'Reassign +2',
    assignee: '2f8253b9-53d8-40b0-94...',
    reporter: 'da5ddfea-116d-4abe-a0...',
    location: 'Construction Site 360'
  },
  {
    id: 'tkt-4',
    title: 'Sub-task of: water issue',
    status: 'To Do',
    priority: 'Medium',
    nextAction: 'Reassign +2',
    assignee: '2f8253b9-53d8-40b0-94...',
    reporter: 'da5ddfea-116d-4abe-a0...',
    location: 'Construction Site 360'
  },
  {
    id: 'tkt-5',
    title: 'water issue',
    status: 'To Do',
    priority: 'Medium',
    nextAction: 'Assign +1',
    assignee: 'Unassigned',
    reporter: 'da5ddfea-116d-4abe-a0...',
    location: 'Construction Site 360'
  },
  {
    id: 'tkt-6',
    title: 'test by user',
    status: 'Pending Post-approval',
    priority: 'Medium',
    nextAction: 'Approve +1',
    assignee: '2f8253b9-53d8-40b0-94...',
    reporter: '2f8253b9-53d8-40b0-...',
    location: 'Construction Site 360'
  },
  {
    id: 'tkt-7',
    title: 'Test: tarp loose near trucks',
    status: 'Done',
    priority: 'Medium',
    nextAction: 'Reopen',
    assignee: '2f8253b9-53d8-40b0-94...',
    reporter: '2f8253b9-53d8-40b0-...',
    location: 'Construction Site 360'
  },
  {
    id: 'tkt-8',
    title: 'Sub-task of: Test: excavator...',
    status: 'Done',
    priority: 'Medium',
    nextAction: 'Reopen',
    assignee: 'ff9b2088-d28d-4231-9ae...',
    reporter: 'da5ddfea-116d-4abe-a0...',
    location: 'Construction Site 360'
  },
  {
    id: 'tkt-9',
    title: 'Test: excavator blocking access...',
    status: 'Done',
    priority: 'Medium',
    nextAction: 'Reopen',
    assignee: '2f8253b9-53d8-40b0-94...',
    reporter: 'da5ddfea-116d-4abe-a0...',
    location: 'Construction Site 360'
  }
];

interface ManageTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onOpenCreateTicket?: () => void;
}

type FilterCategory = 'all' | 'inbox' | 'assigned_to_me' | 'reported_by_me' | 'unassigned' | 'related_to_me';

export function ManageTicketsModal({
  isOpen,
  onClose,
  showToast,
  onOpenCreateTicket
}: ManageTicketsModalProps) {
  const [tickets, setTickets] = useState<TicketItem[]>(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [pageSize, setPageSize] = useState<number>(8);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<keyof TicketItem>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter Card State (Image 3 Reference)
  const [isFilterCardOpen, setIsFilterCardOpen] = useState(false);
  const [modalFilters, setModalFilters] = useState({
    fromDate: '',
    toDate: '',
    status: 'Any',
    camera: 'Any',
    creator: 'Any',
    assignee: 'Any'
  });

  // Filter Counts
  const counts = useMemo(() => {
    return {
      all: tickets.length,
      inbox: tickets.filter(t => t.isInbox).length,
      assigned_to_me: tickets.filter(t => t.isAssignedToMe).length,
      reported_by_me: tickets.filter(t => t.isReportedByMe).length,
      unassigned: tickets.filter(t => t.assignee.toLowerCase() === 'unassigned').length,
      related_to_me: tickets.filter(t => t.isRelatedToMe).length,
    };
  }, [tickets]);

  // Filtered & Sorted Tickets
  const processedTickets = useMemo(() => {
    let list = [...tickets];

    // Filter by category tab
    if (selectedFilter === 'unassigned') {
      list = list.filter(t => t.assignee.toLowerCase() === 'unassigned');
    } else if (selectedFilter === 'inbox') {
      list = list.filter(t => t.isInbox);
    } else if (selectedFilter === 'assigned_to_me') {
      list = list.filter(t => t.isAssignedToMe);
    } else if (selectedFilter === 'reported_by_me') {
      list = list.filter(t => t.isReportedByMe);
    } else if (selectedFilter === 'related_to_me') {
      list = list.filter(t => t.isRelatedToMe);
    }

    // Filter by modal popover filters (Image 3)
    if (modalFilters.status !== 'Any') {
      list = list.filter(t => t.status.toLowerCase() === modalFilters.status.toLowerCase());
    }
    if (modalFilters.camera !== 'Any') {
      const cam = modalFilters.camera.toLowerCase();
      list = list.filter(t => t.location.toLowerCase().includes(cam) || cam.includes(t.location.toLowerCase()));
    }
    if (modalFilters.assignee !== 'Any') {
      list = list.filter(t => t.assignee.toLowerCase().includes(modalFilters.assignee.toLowerCase()));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        t.reporter.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      const valA = String(a[sortField] || '').toLowerCase();
      const valB = String(b[sortField] || '').toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [tickets, selectedFilter, searchQuery, sortField, sortDirection]);

  // Pagination slice
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTickets.slice(start, start + pageSize);
  }, [processedTickets, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(processedTickets.length / pageSize));

  const handleSort = (field: keyof TicketItem) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleNextAction = (ticket: TicketItem) => {
    if (ticket.nextAction.includes('Reopen')) {
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'To Do', nextAction: 'Assign +1' } : t));
      showToast(`Ticket #${ticket.id} (${ticket.title}) has been reopened.`);
    } else if (ticket.nextAction.includes('Assign')) {
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, assignee: 'Michael Reed', nextAction: 'Approve +1' } : t));
      showToast(`Ticket #${ticket.id} assigned to Michael Reed.`);
    } else if (ticket.nextAction.includes('Approve')) {
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'Done', nextAction: 'Reopen' } : t));
      showToast(`Ticket #${ticket.id} approved and closed.`);
    } else {
      showToast(`Executed ${ticket.nextAction} on #${ticket.id}.`);
    }
  };

  // Status visual dot
  const getStatusColor = (status: TicketItem['status']) => {
    switch (status) {
      case 'Done': return '#10b981';
      case 'Pending Post-approval': return '#f59e0b';
      case 'To Do': return '#ef4444';
      case 'In Progress': return '#2563eb';
      default: return '#94a3b8';
    }
  };

  // Header quick tools with simple + icon inside a rectangle
  const headerActions = (
    <div className="manage-tickets-header-tools">
      <div style={{ position: 'relative' }}>
        <button 
          type="button" 
          className={`manage-tickets-tool-btn ${isFilterCardOpen ? 'active' : ''}`}
          title="Filter Tickets"
          onClick={() => setIsFilterCardOpen(prev => !prev)}
          aria-expanded={isFilterCardOpen}
        >
          <Filter size={16} />
        </button>

        <TicketFilterPopoverCard
          isOpen={isFilterCardOpen}
          onClose={() => setIsFilterCardOpen(false)}
          filters={modalFilters}
          onChange={setModalFilters}
          onClear={() => {
            setModalFilters({
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
        className="manage-tickets-tool-btn"
        title="Column Options"
        onClick={() => showToast('Column visibility configuration active.')}
      >
        <Columns size={16} />
      </button>

      {onOpenCreateTicket && (
        <button
          type="button"
          className="manage-tickets-rect-add-btn"
          onClick={onOpenCreateTicket}
          title="Create New Ticket"
          aria-label="Create New Ticket"
        >
          <Plus size={18} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="manage-tickets-title-group">
          <span className="manage-tickets-title">Ticket Management</span>
          <span className="manage-tickets-total-badge">Total {tickets.length}</span>
        </div>
      }
      icon={<Ticket size={20} />}
      headerActions={headerActions}
      maxWidth="1340px"
      width="94vw"
      height="88vh"
      className="manage-tickets-modal-surface"
    >
      <div className="manage-tickets-modal-container">
        {/* Quick Filter Category Pills Row Aligned with Expandable Search Icon */}
        <div className="manage-tickets-filters-bar" role="tablist">
          <div className="manage-tickets-chips-group">
            <button
              type="button"
              className={`manage-tickets-filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => { setSelectedFilter('all'); setCurrentPage(1); }}
            >
              <span>All</span>
              <span className="manage-tickets-pill-count">{counts.all}</span>
            </button>

            <button
              type="button"
              className={`manage-tickets-filter-pill ${selectedFilter === 'inbox' ? 'active' : ''}`}
              onClick={() => { setSelectedFilter('inbox'); setCurrentPage(1); }}
            >
              <span>Inbox</span>
              <span className="manage-tickets-pill-count">{counts.inbox}</span>
            </button>

            <button
              type="button"
              className={`manage-tickets-filter-pill ${selectedFilter === 'assigned_to_me' ? 'active' : ''}`}
              onClick={() => { setSelectedFilter('assigned_to_me'); setCurrentPage(1); }}
            >
              <span>Assigned to Me</span>
              <span className="manage-tickets-pill-count">{counts.assigned_to_me}</span>
            </button>

            <button
              type="button"
              className={`manage-tickets-filter-pill ${selectedFilter === 'reported_by_me' ? 'active' : ''}`}
              onClick={() => { setSelectedFilter('reported_by_me'); setCurrentPage(1); }}
            >
              <span>Reported by Me</span>
              <span className="manage-tickets-pill-count">{counts.reported_by_me}</span>
            </button>

            <button
              type="button"
              className={`manage-tickets-filter-pill ${selectedFilter === 'unassigned' ? 'active' : ''}`}
              onClick={() => { setSelectedFilter('unassigned'); setCurrentPage(1); }}
            >
              <span>Unassigned</span>
              <span className="manage-tickets-pill-count">{counts.unassigned}</span>
            </button>

            <button
              type="button"
              className={`manage-tickets-filter-pill ${selectedFilter === 'related_to_me' ? 'active' : ''}`}
              onClick={() => { setSelectedFilter('related_to_me'); setCurrentPage(1); }}
            >
              <span>Related to Me</span>
              <span className="manage-tickets-pill-count">{counts.related_to_me}</span>
            </button>
          </div>

          {/* Expandable Search Icon aligned with the chips */}
          <div className="manage-tickets-search-align-wrap">
            <SearchField
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title or details..."
              expandable={true}
            />
          </div>
        </div>

        {/* Main Table (No vertical scroll - strictly fits pagination slice) */}
        <div className="manage-tickets-table-wrapper">
          <table className="manage-tickets-table">
            <thead>
              <tr>
                <th 
                  className="manage-tickets-th sortable"
                  onClick={() => handleSort('title')}
                  style={{ width: '22%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Title</span>
                    <ArrowUpDown size={13} style={{ opacity: sortField === 'title' ? 1 : 0.4 }} />
                  </div>
                </th>

                <th 
                  className="manage-tickets-th sortable"
                  onClick={() => handleSort('status')}
                  style={{ width: '16%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Status</span>
                    <ArrowUpDown size={13} style={{ opacity: sortField === 'status' ? 1 : 0.4 }} />
                  </div>
                </th>

                <th 
                  className="manage-tickets-th sortable"
                  onClick={() => handleSort('priority')}
                  style={{ width: '12%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Priority</span>
                    <ArrowUpDown size={13} style={{ opacity: sortField === 'priority' ? 1 : 0.4 }} />
                  </div>
                </th>

                <th className="manage-tickets-th" style={{ width: '13%' }}>
                  Next Action
                </th>

                <th 
                  className="manage-tickets-th sortable"
                  onClick={() => handleSort('assignee')}
                  style={{ width: '15%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Assignee</span>
                    <ArrowUpDown size={13} style={{ opacity: sortField === 'assignee' ? 1 : 0.4 }} />
                  </div>
                </th>

                <th className="manage-tickets-th" style={{ width: '13%' }}>
                  Reporter
                </th>

                <th 
                  className="manage-tickets-th sortable"
                  onClick={() => handleSort('location')}
                  style={{ width: '14%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Location</span>
                    <ArrowUpDown size={13} style={{ opacity: sortField === 'location' ? 1 : 0.4 }} />
                  </div>
                </th>

                <th className="manage-tickets-th" style={{ width: '6%', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedTickets.length > 0 ? (
                paginatedTickets.map((ticket) => {
                  const isUnassigned = ticket.assignee.toLowerCase() === 'unassigned';
                  return (
                    <tr key={ticket.id}>
                      {/* Title */}
                      <td className="manage-tickets-td" style={{ fontWeight: 600 }}>
                        <span title={ticket.title}>{ticket.title}</span>
                      </td>

                      {/* Status */}
                      <td className="manage-tickets-td">
                        <span className="manage-tickets-status-cell">
                          <span 
                            className="manage-tickets-status-dot" 
                            style={{ backgroundColor: getStatusColor(ticket.status) }} 
                          />
                          <span>{ticket.status}</span>
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="manage-tickets-td">
                        <span className="manage-tickets-priority-cell">
                          <span 
                            className="manage-tickets-status-dot" 
                            style={{ backgroundColor: '#f59e0b' }} 
                          />
                          <span>{ticket.priority}</span>
                        </span>
                      </td>

                      {/* Next Action */}
                      <td className="manage-tickets-td">
                        <button
                          type="button"
                          className="manage-tickets-action-link"
                          onClick={() => handleNextAction(ticket)}
                          title={`Execute ${ticket.nextAction}`}
                        >
                          {ticket.nextAction}
                        </button>
                      </td>

                      {/* Assignee */}
                      <td className="manage-tickets-td">
                        <span className={`manage-tickets-assignee-text ${isUnassigned ? 'manage-tickets-assignee-unassigned' : ''}`} title={ticket.assignee}>
                          {ticket.assignee}
                        </span>
                      </td>

                      {/* Reporter */}
                      <td className="manage-tickets-td">
                        <span className="manage-tickets-reporter-text" title={ticket.reporter}>
                          {ticket.reporter}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="manage-tickets-td">
                        <span className="manage-tickets-location-text" title={ticket.location}>
                          {ticket.location}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="manage-tickets-td" style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="manage-tickets-more-btn"
                          title="Ticket Actions"
                          onClick={() => showToast(`Opened options menu for ticket #${ticket.id}.`)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                    No tickets found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar (Reference Image 2: Rows per page selector + page navigation) */}
        <div className="manage-tickets-pagination-bar">
          <div>
            Showing {processedTickets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, processedTickets.length)} of {processedTickets.length} tickets
          </div>

          <div className="manage-tickets-pagination-right">
            <RowsPerPageSelector
              value={pageSize}
              onChange={(val) => {
                setPageSize(val);
                setCurrentPage(1);
              }}
              options={[8, 10, 15, 25]}
              label="Rows per page:"
            />

            <div className="manage-tickets-page-controls">
              <button
                type="button"
                className="manage-tickets-page-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`manage-tickets-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                className="manage-tickets-page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
