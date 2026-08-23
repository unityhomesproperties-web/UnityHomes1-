import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, MessageSquare, PlusCircle, CheckCircle, AlertTriangle, 
  Send, Image as ImageIcon, X, Clock, FileText, ChevronRight, User, ShieldAlert,
  ArrowLeft, Search
} from 'lucide-react';
import { 
  UserSession, 
  SupportTicket, 
  SupportCategory, 
  SupportPriority, 
  SupportContactPreference,
  SupportStatus,
  SupportTicketMessage 
} from '../../types';

interface SupportCenterProps {
  session: UserSession;
  initialTab?: 'my-tickets' | 'new-request';
  preselectedCategory?: SupportCategory;
  onClose?: () => void;
}

export default function SupportCenter({ 
  session, 
  initialTab = 'my-tickets',
  preselectedCategory,
  onClose
}: SupportCenterProps) {
  const [activeTab, setActiveTab] = useState<'my-tickets' | 'new-request'>(initialTab);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Form states
  const [category, setCategory] = useState<SupportCategory>(preselectedCategory || 'Other');
  const [description, setDescription] = useState('');
  const [affectedFeature, setAffectedFeature] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [contactPreference, setContactPreference] = useState<SupportContactPreference>('In-App Response');
  const [priority, setPriority] = useState<SupportPriority>('Normal');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  
  // Reply state
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState('');

  // Search in my tickets
  const [searchQuery, setSearchQuery] = useState('');

  // Load tickets from localStorage
  const loadTickets = () => {
    try {
      const stored = localStorage.getItem('uh_support_tickets_v1');
      if (stored) {
        const parsed: SupportTicket[] = JSON.parse(stored);
        setTickets(parsed);
      }
    } catch (e) {
      console.error('Error loading support tickets:', e);
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

  // Update category when preselectedCategory changes
  useEffect(() => {
    if (preselectedCategory) {
      setCategory(preselectedCategory);
      setActiveTab('new-request');
    }
  }, [preselectedCategory]);

  // Filter user's tickets
  const isUserMatch = (ticket: SupportTicket) => {
    if (session.role === 'Admin') return true; // Admin can see all if opened as admin
    const sName = (session.name || '').toLowerCase();
    const sEmail = (session.email || '').toLowerCase();
    const sEnt = (session.entityId || '').toLowerCase();
    
    // Check ticket user fields
    const tName = (ticket.userName || '').toLowerCase();
    const tEmail = (ticket.userEmail || '').toLowerCase();
    const tId = (ticket.userId || '').toLowerCase();

    if (tEmail && sEmail && tEmail === sEmail) return true;
    if (tId && sEnt && tId === sEnt) return true;
    if (tName && sName && (tName.includes(sName) || sName.includes(tName))) return true;

    // Matching for demo accounts
    if (sName.includes('fashola') && tName.includes('fashola')) return true;
    if (sName.includes('lagos realty') && tName.includes('lagos realty')) return true;
    if (sName.includes('james') && tName.includes('james')) return true;
    if (session.role === 'Tenant' && (tName.includes('tenant') || tName.includes('aminu'))) return true;

    return false;
  };

  const myTickets = tickets.filter(isUserMatch).filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.refNumber.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  });

  // Handle screenshot upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (screenshots.length + files.length > 3) {
      alert('You can upload a maximum of 3 screenshots per support request.');
      return;
    }

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshots(prev => [...prev, event.target!.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  // Submit new ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please describe your issue or question.');
      return;
    }

    const nextNum = tickets.length + 1;
    const refStr = `UH-SUP-${String(nextNum).padStart(4, '0')}`;
    const timestamp = new Date().toISOString();

    const newTicketMessage: SupportTicketMessage = {
      id: `msg-${Date.now()}-1`,
      senderName: session.name || 'User',
      senderRole: session.role || 'User',
      senderEmail: session.email || '',
      message: description.trim(),
      timestamp: timestamp,
      attachments: screenshots
    };

    const newTicket: SupportTicket = {
      id: refStr,
      refNumber: refStr,
      userId: session.entityId || session.name,
      userName: session.name || 'Unity User',
      userRole: session.role || 'User',
      userEmail: session.email || 'user@unityhomes.ng',
      category: category,
      description: description.trim(),
      affectedPageOrFeature: category === 'Technical Problem or Bug' ? affectedFeature.trim() : undefined,
      screenshots: screenshots,
      contactPreference: contactPreference,
      priority: priority,
      status: 'New',
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: [newTicketMessage]
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem('uh_support_tickets_v1', JSON.stringify(updatedTickets));

    // Create Admin notification
    try {
      const rawNotifs = localStorage.getItem('uh_notifications_v1');
      const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
      const adminNotif = {
        id: 'notif-sup-' + Date.now(),
        role: 'Admin',
        targetId: 'admin',
        title: `New Support Ticket #${refStr} [${priority}]`,
        message: `${session.name} (${session.role}) submitted support request #${refStr}: "${category}" - "${description.substring(0, 80)}..."`,
        timestamp: timestamp,
        read: false,
        isUrgent: priority === 'Urgent'
      };
      localStorage.setItem('uh_notifications_v1', JSON.stringify([adminNotif, ...notifs]));
    } catch (err) {
      console.error('Error creating admin notification:', err);
    }

    // Trigger storage event for live reactive components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'uh_support_tickets_v1',
      newValue: JSON.stringify(updatedTickets)
    }));

    setSubmittedRef(refStr);
    setDescription('');
    setAffectedFeature('');
    setScreenshots([]);
  };

  // Submit reply to an existing ticket
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const timestamp = new Date().toISOString();
    const newMessage: SupportTicketMessage = {
      id: `msg-${Date.now()}`,
      senderName: session.name || 'User',
      senderRole: session.role || 'User',
      senderEmail: session.email || '',
      message: replyText.trim(),
      timestamp: timestamp
    };

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      updatedAt: timestamp,
      status: session.role === 'Admin' ? 'In Progress' : 'In Progress',
      messages: [...selectedTicket.messages, newMessage]
    };

    const updatedList = tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t);
    setTickets(updatedList);
    setSelectedTicket(updatedTicket);
    localStorage.setItem('uh_support_tickets_v1', JSON.stringify(updatedList));

    // Notify Admin or User depending on who sent the reply
    try {
      const rawNotifs = localStorage.getItem('uh_notifications_v1');
      const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
      const notifRole = session.role === 'Admin' ? selectedTicket.userRole : 'Admin';
      const notifTarget = session.role === 'Admin' ? selectedTicket.userId : 'admin';
      
      const newNotif = {
        id: 'notif-sup-reply-' + Date.now(),
        role: notifRole,
        targetId: notifTarget,
        title: `Reply on Support Ticket #${selectedTicket.refNumber}`,
        message: `${session.name} replied on ticket #${selectedTicket.refNumber}: "${replyText.substring(0, 80)}..."`,
        timestamp: timestamp,
        read: false
      };
      localStorage.setItem('uh_notifications_v1', JSON.stringify([newNotif, ...notifs]));
    } catch (e) {
      console.error(e);
    }

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'uh_support_tickets_v1',
      newValue: JSON.stringify(updatedList)
    }));

    setReplyText('');
    setReplySuccess('Reply sent successfully!');
    setTimeout(() => setReplySuccess(''), 3000);
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
    <div className="bg-white rounded-[var(--radius-large)] border border-stone-200/80 shadow-sm overflow-hidden max-w-5xl w-full mx-auto font-sans">
      {/* HEADER BAR */}
      <div className="bg-[#18452E] text-white p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
            <HelpCircle className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-lg font-display font-extrabold tracking-tight">Unity Homes Support Center</h2>
            <p className="text-xs text-emerald-200/80">
              Direct assistance from the Unity Homes platform support & technical staff
            </p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition text-emerald-200 hover:text-white cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-stone-200 bg-stone-50/80 px-6 pt-3 gap-2">
        <button
          onClick={() => { setActiveTab('my-tickets'); setSelectedTicket(null); setSubmittedRef(null); }}
          className={`px-5 py-3 font-display text-xs font-bold rounded-t-2xl border-t border-x transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'my-tickets'
              ? 'bg-white border-stone-200 text-[#18452E] shadow-xs -mb-px'
              : 'border-transparent text-#6B7280 hover:text-#132A1D'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Support Tickets</span>
          {myTickets.length > 0 && (
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              {myTickets.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('new-request'); setSelectedTicket(null); setSubmittedRef(null); }}
          className={`px-5 py-3 font-display text-xs font-bold rounded-t-2xl border-t border-x transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'new-request'
              ? 'bg-white border-stone-200 text-[#18452E] shadow-xs -mb-px'
              : 'border-transparent text-#6B7280 hover:text-#132A1D'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Support Request</span>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="p-6">
        {/* TAB 1: MY SUPPORT TICKETS */}
        {activeTab === 'my-tickets' && (
          <div>
            {!selectedTicket ? (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search tickets by reference number, category, or keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0E2F1F]"
                    />
                  </div>
                  <button
                    onClick={() => setActiveTab('new-request')}
                    className="px-4 py-2 bg-[#18452E] text-white rounded-xl text-xs font-bold hover:bg-[#112d22] transition flex items-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Ticket</span>
                  </button>
                </div>

                {/* Ticket List */}
                {myTickets.length === 0 ? (
                  <div className="text-center py-12 bg-stone-50/50 rounded-[var(--radius-large)] border border-dashed border-stone-200 p-8 space-y-3">
                    <HelpCircle className="w-12 h-12 text-stone-300 mx-auto" />
                    <h3 className="font-display font-bold text-#132A1D text-sm">No Support Tickets Found</h3>
                    <p className="text-#6B7280 text-xs max-w-md mx-auto">
                      Have a technical problem, billing question, or feature inquiry? Create a new support ticket and our dedicated platform staff will assist you.
                    </p>
                    <button
                      onClick={() => setActiveTab('new-request')}
                      className="mt-2 px-5 py-2.5 bg-[#18452E] text-white rounded-xl text-xs font-bold hover:bg-[#112d22] transition inline-flex items-center space-x-2 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Submit New Support Request</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="bg-white border border-stone-200 hover:border-emerald-300 rounded-2xl p-4 transition shadow-2xs hover:shadow-md cursor-pointer group space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-xs text-[#18452E] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                              #{ticket.refNumber}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${getPriorityBadge(ticket.priority)}`}>
                              {ticket.priority} Priority
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadge(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-stone-400 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Submitted {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-#132A1D text-sm group-hover:text-[#18452E] transition">
                            {ticket.category}
                          </h4>
                          <p className="text-xs text-#6B7280 line-clamp-2 mt-1">
                            {ticket.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
                          <span className="text-[11px] text-#6B7280 font-medium flex items-center space-x-1">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{ticket.messages.length} message(s) in thread</span>
                          </span>
                          <span className="text-[11px] font-bold text-[#18452E] group-hover:translate-x-1 transition flex items-center space-x-1">
                            <span>View Thread</span>
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* SINGLE TICKET THREAD VIEW */
              <div className="space-y-6 animate-fade-in">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-3.5 py-1.5 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to My Tickets</span>
                </button>

                {/* Ticket Details Summary Card */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-sm text-[#18452E] bg-emerald-100/60 px-3 py-1 rounded-xl border border-emerald-200">
                        #{selectedTicket.refNumber}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${getPriorityBadge(selectedTicket.priority)}`}>
                        {selectedTicket.priority} Priority
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadge(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                    </div>

                    <div className="text-right text-[11px] font-mono text-#6B7280">
                      Submitted: {new Date(selectedTicket.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-stone-400 font-mono text-[10px] uppercase block">Issue Category</span>
                      <strong className="text-#132A1D font-bold">{selectedTicket.category}</strong>
                    </div>

                    <div>
                      <span className="text-stone-400 font-mono text-[10px] uppercase block">Contact Preference</span>
                      <strong className="text-#132A1D font-bold">{selectedTicket.contactPreference}</strong>
                    </div>

                    {selectedTicket.affectedPageOrFeature && (
                      <div className="col-span-2">
                        <span className="text-stone-400 font-mono text-[10px] uppercase block">Affected Page/Feature</span>
                        <p className="text-#132A1D bg-white p-2 rounded-lg border border-stone-200 font-mono text-[11px]">
                          {selectedTicket.affectedPageOrFeature}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CONVERSATION THREAD */}
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-#132A1D text-xs uppercase tracking-wider flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-[#18452E]" />
                    <span>Communication Thread ({selectedTicket.messages.length})</span>
                  </h3>

                  <div className="space-y-4">
                    {selectedTicket.messages.map((msg, idx) => {
                      const isAdmin = msg.senderRole === 'Admin' || msg.senderName.toLowerCase().includes('admin') || msg.senderName.toLowerCase().includes('unity homes support');
                      return (
                        <div 
                          key={msg.id || idx}
                          className={`p-4 rounded-2xl border ${
                            isAdmin 
                              ? 'bg-emerald-50/70 border-emerald-200 ml-4 md:ml-8' 
                              : 'bg-white border-stone-200 mr-4 md:mr-8 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-stone-200/50 pb-2 mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                isAdmin ? 'bg-[#18452E] text-white' : 'bg-stone-200 text-#132A1D'
                              }`}>
                                {isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                              </div>
                              <span className="font-bold text-xs text-#132A1D">{msg.senderName}</span>
                              <span className={`text-[9px] font-mono px-2 py-0.2 rounded font-bold uppercase ${
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

                {/* REPLY INPUT AREA */}
                {selectedTicket.status !== 'Resolved' ? (
                  <form onSubmit={handleSendReply} className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-sm">
                    <label className="block text-xs font-bold text-#132A1D">
                      Send Reply to Support
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0E2F1F]"
                    />

                    {replySuccess && (
                      <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg font-bold">
                        {replySuccess}
                      </p>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#18452E] hover:bg-[#112d22] text-white font-bold text-xs rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-medium flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>This ticket has been resolved. If you have a new question, please submit a new support request.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NEW SUPPORT REQUEST FORM */}
        {activeTab === 'new-request' && (
          <div>
            {submittedRef ? (
              /* CONFIRMATION SCREEN */
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-[var(--radius-large)] p-8 text-center space-y-4 max-w-xl mx-auto my-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider block">Support Request Submitted</span>
                  <h3 className="font-display font-extrabold text-#132A1D text-xl">
                    Reference #{submittedRef}
                  </h3>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-100 text-xs text-#132A1D leading-relaxed space-y-2 text-left">
                  <p>
                    <strong>Your support request has been received. Reference number: #{submittedRef}.</strong>
                  </p>
                  <p>
                    We typically respond within <strong>24 business hours</strong> for Normal priority and within <strong>4 hours</strong> for Urgent priority.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => { setSubmittedRef(null); setActiveTab('my-tickets'); }}
                    className="px-5 py-2.5 bg-[#18452E] text-white rounded-xl font-bold text-xs hover:bg-[#112d22] transition cursor-pointer shadow-sm"
                  >
                    View My Support Tickets
                  </button>
                  <button
                    onClick={() => { setSubmittedRef(null); }}
                    className="px-5 py-2.5 bg-white border border-stone-300 text-#132A1D rounded-xl font-bold text-xs hover:bg-stone-50 transition cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              /* TICKET FORM */
              <form onSubmit={handleSubmitTicket} className="space-y-5 max-w-2xl mx-auto">
                <div className="border-b border-stone-200 pb-3">
                  <h3 className="font-display font-bold text-#132A1D text-sm uppercase tracking-wider">
                    Submit Platform Support Ticket
                  </h3>
                  <p className="text-#6B7280 text-xs">
                    Contact Unity Homes platform staff for account, billing, feature, or technical assistance.
                  </p>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-#132A1D mb-1">
                    Issue Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SupportCategory)}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-#132A1D focus:outline-none focus:ring-1 focus:ring-[#0E2F1F]"
                  >
                    <option value="Account and Login Issues">1. Account and Login Issues</option>
                    <option value="Billing and Subscription">2. Billing and Subscription</option>
                    <option value="Technical Problem or Bug">3. Technical Problem or Bug</option>
                    <option value="Feature Question">4. Feature Question</option>
                    <option value="Data or Record Concern">5. Data or Record Concern</option>
                    <option value="Professional Connection Issue">6. Professional Connection Issue</option>
                    <option value="Other">7. Other</option>
                  </select>
                </div>

                {/* Conditional Field for Tech Bug */}
                {category === 'Technical Problem or Bug' && (
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-2 animate-fade-in">
                    <label className="block text-xs font-bold text-amber-900">
                      What page or feature was affected and what happened? (Optional)
                    </label>
                    <input
                      type="text"
                      value={affectedFeature}
                      onChange={(e) => setAffectedFeature(e.target.value)}
                      placeholder="e.g. Surulere properties payment history page shows loading spinner error"
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                    />
                  </div>
                )}

                {/* Issue Description */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-#132A1D">
                      Issue Description *
                    </label>
                    <span className={`text-[10px] font-mono ${description.length > 900 ? 'text-red-600 font-bold' : 'text-stone-400'}`}>
                      {description.length} / 1000
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    maxLength={1000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed description of your question or problem..."
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0E2F1F]"
                  />
                </div>

                {/* Screenshot Upload (Max 3) */}
                <div>
                  <label className="block text-xs font-bold text-#132A1D mb-1">
                    Screenshot Upload (Optional, up to 3 images)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {screenshots.map((src, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl border border-stone-300 overflow-hidden group">
                        <img src={src} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {screenshots.length < 3 && (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-500 bg-stone-50 hover:bg-emerald-50/30 flex flex-col items-center justify-center cursor-pointer transition text-#6B7280 hover:text-emerald-700">
                        <ImageIcon className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Contact Preference & Priority Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Preference */}
                  <div>
                    <label className="block text-xs font-bold text-#132A1D mb-1">
                      Contact Preference *
                    </label>
                    <select
                      value={contactPreference}
                      onChange={(e) => setContactPreference(e.target.value as SupportContactPreference)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-#132A1D focus:outline-none focus:ring-1 focus:ring-[#0E2F1F]"
                    >
                      <option value="In-App Response">In-App Response</option>
                      <option value="Email Response">Email Response</option>
                      <option value="WhatsApp Response">WhatsApp Response</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-bold text-#132A1D mb-1">
                      Priority Level *
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as SupportPriority)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-#132A1D focus:outline-none focus:ring-1 focus:ring-[#0E2F1F]"
                    >
                      <option value="Normal">Normal Priority</option>
                      <option value="Urgent">Urgent Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>

                    {priority === 'Urgent' && (
                      <p className="text-[10px] text-red-700 font-bold bg-red-50 border border-red-200 p-2 rounded-lg mt-1.5 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Urgent priority is reserved for account lockouts or active payment issues only.</span>
                      </p>
                    )}

                    {priority === 'Low' && (
                      <p className="text-[10px] text-#6B7280 font-medium bg-stone-50 p-2 rounded-lg mt-1.5">
                        Low priority is intended for general platform feature questions.
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-stone-200 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#18452E] hover:bg-[#112d22] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Request to Admin</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
