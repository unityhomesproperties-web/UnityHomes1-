// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, MessageSquare, Clock, CheckCircle2, AlertTriangle, 
  Send, Search, Filter, ShieldAlert, User, ChevronRight, ArrowLeft,
  X, CheckCircle, FileText
} from 'lucide-react';
import { 
  UserSession, 
  SupportTicket, 
  SupportStatus, 
  SupportPriority, 
  SupportCategory,
  SupportTicketMessage 
} from '../../types';

interface AdminSupportCenterProps {
  session: UserSession;
}

export default function AdminSupportCenter({ session }: AdminSupportCenterProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Response Form
  const [adminResponseText, setAdminResponseText] = useState('');
  const [newStatus, setNewStatus] = useState<SupportStatus>('In Progress');
  const [responseSuccess, setResponseSuccess] = useState('');

  // Load tickets
  const loadTickets = () => {
    try {
      const stored = localStorage.getItem('uh_support_tickets_v1');
      if (stored) {
        const parsed: SupportTicket[] = JSON.parse(stored);
        setTickets(parsed);
      }
    } catch (e) {
      console.error('Error loading tickets in AdminSupportCenter:', e);
    }
  };

  useEffect(() => {
    loadTickets();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'uh_support_tickets_v1') {
        loadTickets();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ANALYTICS CALCULATIONS (Step Five)
  const openTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;
  
  const urgentOpenTicketsCount = tickets.filter(
    t => t.priority === 'Urgent' && t.status !== 'Resolved'
  ).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const resolvedThisMonth = tickets.filter(t => {
    if (t.status !== 'Resolved') return false;
    const d = new Date(t.updatedAt || t.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Calculate Average Response Time across resolved tickets
  const calculateAvgResponseTime = () => {
    const resolvedWithResponse = tickets.filter(t => t.firstAdminResponseAt && t.createdAt);
    if (resolvedWithResponse.length === 0) return '2.0';

    let totalDiffMs = 0;
    resolvedWithResponse.forEach(t => {
      const start = new Date(t.createdAt).getTime();
      const end = new Date(t.firstAdminResponseAt!).getTime();
      const diff = end - start;
      if (diff > 0) totalDiffMs += diff;
    });

    const avgHours = (totalDiffMs / resolvedWithResponse.length) / (1000 * 60 * 60);
    return avgHours.toFixed(1);
  };

  const avgResponseTimeHours = calculateAvgResponseTime();

  // Filtered Tickets
  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.refNumber.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.userRole.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Submit Admin Response
  const handleAdminResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminResponseText.trim()) return;

    const timestamp = new Date().toISOString();
    const newMessage: SupportTicketMessage = {
      id: `msg-admin-${Date.now()}`,
      senderName: 'Unity Homes Support',
      senderRole: 'Admin',
      senderEmail: session.email || 'admin@unityhomes.ng',
      message: adminResponseText.trim(),
      timestamp: timestamp
    };

    const isFirstResponse = !selectedTicket.firstAdminResponseAt;

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      updatedAt: timestamp,
      status: newStatus,
      firstAdminResponseAt: isFirstResponse ? timestamp : selectedTicket.firstAdminResponseAt,
      resolutionNote: newStatus === 'Resolved' ? adminResponseText.trim() : selectedTicket.resolutionNote,
      messages: [...selectedTicket.messages, newMessage]
    };

    const updatedList = tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t);
    setTickets(updatedList);
    setSelectedTicket(updatedTicket);
    localStorage.setItem('uh_support_tickets_v1', JSON.stringify(updatedList));

    // Send in-app notification to submitting user
    try {
      const rawNotifs = localStorage.getItem('uh_notifications_v1');
      const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
      const userNotif = {
        id: 'notif-sup-admin-' + Date.now(),
        role: selectedTicket.userRole,
        targetId: selectedTicket.userId,
        title: `Response on Support Ticket #${selectedTicket.refNumber}`,
        message: `Admin staff responded to your support ticket #${selectedTicket.refNumber} [${newStatus}]: "${adminResponseText.substring(0, 100)}..."`,
        timestamp: timestamp,
        read: false
      };
      localStorage.setItem('uh_notifications_v1', JSON.stringify([userNotif, ...notifs]));
    } catch (err) {
      console.error(err);
    }

    // Dispatch email log
    try {
      const rawEmails = localStorage.getItem('uh_sent_emails_v1');
      const emails = rawEmails ? JSON.parse(rawEmails) : [];
      const emailLog = {
        id: 'email-' + Date.now(),
        recipientEmail: selectedTicket.userEmail,
        subject: `[Unity Homes Support] Response to Ticket #${selectedTicket.refNumber}`,
        body: `Dear ${selectedTicket.userName},\n\nAdmin staff has responded to your ticket #${selectedTicket.refNumber}:\n\n"${adminResponseText}"\n\nTicket Status: ${newStatus}\n\nYou can view the full thread in your Support Center.`,
        sentAt: timestamp,
        status: 'delivered'
      };
      localStorage.setItem('uh_sent_emails_v1', JSON.stringify([emailLog, ...emails]));
    } catch (err) {
      console.error(err);
    }

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'uh_support_tickets_v1',
      newValue: JSON.stringify(updatedList)
    }));

    setAdminResponseText('');
    setResponseSuccess('Admin response recorded and user notified!');
    setTimeout(() => setResponseSuccess(''), 3000);
  };

  const getPriorityBadge = (p: SupportPriority) => {
    switch (p) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Normal':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low':
        return 'bg-stone-50 text-#132A1D border-stone-200';
      default:
        return 'bg-stone-50 text-#132A1D border-stone-200';
    }
  };

  const getStatusBadge = (s: SupportStatus) => {
    switch (s) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Awaiting User Response':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      default:
        return 'bg-stone-50 text-#132A1D border-stone-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER TITLE */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-[#18452E]">
            <HelpCircle className="w-5 h-5" />
            <h2 className="font-display font-semibold text-#132A1D text-lg uppercase tracking-wider">
              Platform Support Tickets Command Center
            </h2>
          </div>
          <p className="text-xs text-#6B7280 mt-0.5">
            Manage, respond, and resolve all platform user inquiry tickets across all roles.
          </p>
        </div>
      </div>

      {/* SUMMARY ROW ANALYTICS CARDS (Step Five) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Open Tickets */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-#6B7280">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">Open Tickets</span>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-display font-semibold text-#132A1D">
            {openTicketsCount}
          </div>
          <span className="text-[10px] text-stone-400 block">Pending admin resolution</span>
        </div>

        {/* Card 2: Urgent Tickets */}
        <div className="bg-red-50/80 p-4 rounded-2xl border border-red-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">Urgent Tickets</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-display font-semibold text-red-900">
            {urgentOpenTicketsCount}
          </div>
          <span className="text-[10px] text-red-700 font-medium block">Account lockouts or payment issues</span>
        </div>

        {/* Card 3: Average Response Time */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-#6B7280">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">Avg Response Time</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-display font-semibold text-[#18452E]">
            {avgResponseTimeHours} <span className="text-xs font-normal text-#6B7280">hrs</span>
          </div>
          <span className="text-[10px] text-stone-400 block">First admin response metric</span>
        </div>

        {/* Card 4: Tickets Resolved This Month */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-#6B7280">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">Resolved This Month</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-display font-semibold text-#132A1D">
            {resolvedThisMonth.length}
          </div>
          <span className="text-[10px] text-stone-400 block">Completed support dockets</span>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      {!selectedTicket ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ref number, user name, role, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0E2F1F]"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-#132A1D"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Awaiting User Response">Awaiting User Response</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-#132A1D"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* TABLE OF TICKETS */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 font-mono text-[10px] text-#6B7280 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Ref #</th>
                    <th className="p-3.5">Submitting User</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Date Submitted</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400 font-medium">
                        No support tickets match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr 
                        key={t.id} 
                        className="hover:bg-stone-50/80 transition cursor-pointer group"
                        onClick={() => setSelectedTicket(t)}
                      >
                        <td className="p-3.5 font-mono font-semibold text-[#18452E]">
                          #{t.refNumber}
                        </td>

                        <td className="p-3.5">
                          <strong className="block text-#132A1D font-semibold">{t.userName}</strong>
                          <span className="text-[10px] font-mono text-#6B7280 uppercase px-1.5 py-0.2 bg-stone-50 rounded">
                            {t.userRole}
                          </span>
                        </td>

                        <td className="p-3.5 font-medium text-#132A1D">
                          {t.category}
                        </td>

                        <td className="p-3.5">
                          <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border uppercase ${getPriorityBadge(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono text-#6B7280">
                          {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        <td className="p-3.5">
                          <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadge(t.status)}`}>
                            {t.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(t);
                            }}
                            className="px-3 py-1.5 bg-stone-50 group-hover:bg-[#18452E] group-hover:text-white text-#132A1D rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            Respond
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* SINGLE TICKET ADMIN VIEW AND RESPONSE PANEL */
        <div className="space-y-6 animate-fade-in">
          <button
            onClick={() => setSelectedTicket(null)}
            className="px-3.5 py-1.5 bg-stone-50 hover:bg-stone-200 text-#132A1D font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tickets</span>
          </button>

          {/* Ticket Metadata Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-semibold text-base text-[#18452E] bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  #{selectedTicket.refNumber}
                </span>
                <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border uppercase ${getPriorityBadge(selectedTicket.priority)}`}>
                  {selectedTicket.priority} Priority
                </span>
                <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadge(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>

              <div className="text-right text-xs font-mono text-#6B7280">
                Submitted: {new Date(selectedTicket.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">Submitting User</span>
                <strong className="text-#132A1D font-semibold text-sm">{selectedTicket.userName}</strong>
                <span className="text-[10px] text-#6B7280 block">{selectedTicket.userRole} &bull; {selectedTicket.userEmail}</span>
              </div>

              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">Issue Category</span>
                <strong className="text-#132A1D font-semibold">{selectedTicket.category}</strong>
              </div>

              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">Contact Preference</span>
                <strong className="text-#132A1D font-semibold">{selectedTicket.contactPreference}</strong>
              </div>

              {selectedTicket.affectedPageOrFeature && (
                <div className="col-span-3">
                  <span className="text-stone-400 font-mono text-[10px] uppercase block">Affected Feature / Page</span>
                  <p className="text-#132A1D bg-stone-50 p-2 rounded-lg border border-stone-200 font-mono text-[11px]">
                    {selectedTicket.affectedPageOrFeature}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* THREADED MESSAGES */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-#132A1D text-xs uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#18452E]" />
              <span>Conversation Thread</span>
            </h3>

            <div className="space-y-4">
              {selectedTicket.messages.map((msg, idx) => {
                const isAdmin = msg.senderRole === 'Admin' || msg.senderName.toLowerCase().includes('admin');
                return (
                  <div 
                    key={msg.id || idx}
                    className={`p-4 rounded-2xl border ${
                      isAdmin 
                        ? 'bg-emerald-50/80 border-emerald-200 ml-4 md:ml-8' 
                        : 'bg-white border-stone-200 mr-4 md:mr-8 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-stone-200/50 pb-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-[10px] ${
                          isAdmin ? 'bg-[#18452E] text-white' : 'bg-stone-200 text-#132A1D'
                        }`}>
                          {isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-semibold text-xs text-#132A1D">{msg.senderName}</span>
                        <span className={`text-[9px] font-mono px-2 py-0.2 rounded font-semibold uppercase ${
                          isAdmin ? 'bg-emerald-800 text-white' : 'bg-stone-50 text-#6B7280'
                        }`}>
                          {msg.senderRole}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-stone-400">
                        {new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <p className="text-xs text-#132A1D whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-stone-200/50">
                        {msg.attachments.map((att, aIdx) => (
                          <a 
                            key={aIdx} 
                            href={att} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block w-16 h-16 rounded-xl border border-stone-300 overflow-hidden hover:opacity-90 transition"
                          >
                            <img src={att} alt={`attachment-${aIdx}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADMIN RESPONSE FORM */}
          <form onSubmit={handleAdminResponseSubmit} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="font-display font-semibold text-#132A1D text-xs uppercase tracking-wider flex items-center space-x-2">
              <Send className="w-4 h-4 text-[#18452E]" />
              <span>Admin Response &amp; Status Update</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-#132A1D mb-1">
                Admin Message to User *
              </label>
              <textarea
                rows={3}
                required
                value={adminResponseText}
                onChange={(e) => setAdminResponseText(e.target.value)}
                placeholder="Type official admin response or instructions..."
                className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0E2F1F]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-#132A1D mb-1">
                  Update Ticket Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as SupportStatus)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-#132A1D"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Awaiting User Response">Awaiting User Response</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="flex items-end">
                {responseSuccess && (
                  <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 w-full block text-center">
                    {responseSuccess}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-stone-50 hover:bg-stone-200 text-#132A1D font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#18452E] hover:bg-[#112d22] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Admin Response</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
