import React, { useState } from 'react';
import { X, Bell, DollarSign, Wrench, AlertTriangle, MessageSquare, MoreHorizontal, Pin, Archive, UserCheck, ShieldAlert, CheckCircle, Mail, MessageCircle } from 'lucide-react';
import { useLiveCollection, updateDocument } from '../../lib/database';

interface NotificationFeedProps {
  onClose: () => void;
  role: string;
  targetId?: string;
}

export default function NotificationFeed({ onClose, role, targetId }: NotificationFeedProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Firestore real-time listener filtering by recipient role and targetId
  const liveNotifications = useLiveCollection('notifications', [], (allNotifs) => {
    return allNotifs.filter(n => {
      if (role === 'Admin') {
        return n.role === 'Admin' || n.targetId === 'Admin';
      }
      
      if (n.role !== role) return false;
      
      // If a specific target ID is specified, ensure it matches
      if (targetId && n.targetId && n.targetId !== targetId) return false;
      
      return true;
    });
  });

  const handlePin = (id: string) => {
    if (pinnedIds.includes(id)) {
      setPinnedIds(pinnedIds.filter(pid => pid !== id));
    } else {
      setPinnedIds([...pinnedIds, id]);
    }
    setOpenMenuId(null);
  };

  const handleArchive = (id: string) => {
    if (archivedIds.includes(id)) {
      setArchivedIds(archivedIds.filter(aid => aid !== id));
    } else {
      setArchivedIds([...archivedIds, id]);
    }
    setOpenMenuId(null);
  };

  const handleMarkAsRead = (id: string) => {
    updateDocument<any>('notifications', id, { read: true });
  };

  const handleMarkAllAsRead = () => {
    liveNotifications.forEach(n => {
      if (!n.read) {
        updateDocument<any>('notifications', n.id, { read: true });
      }
    });
  };

  const filterTabs = ['All', 'Unread', 'Today', 'This Week', 'Payments', 'Maintenance', 'Leases', 'Archived'];

  // Map UnifiedNotification schema to Display schema
  const mappedNotifications = liveNotifications.map(n => {
    let icon = Bell;
    let color = 'text-#6B7280';
    let bg = 'bg-stone-50';
    let title = 'Notification';

    switch (n.type) {
      case 'payment_confirmed':
        icon = DollarSign;
        color = 'text-emerald-600';
        bg = 'bg-emerald-100';
        title = 'Payment Confirmed';
        break;
      case 'promise_created':
        icon = MessageSquare;
        color = 'text-[#18452E]';
        bg = 'bg-[#18452E]/10';
        title = 'Promise to Pay Created';
        break;
      case 'promise_broken':
        icon = AlertTriangle;
        color = 'text-rose-600';
        bg = 'bg-rose-100';
        title = 'Payment Promise Broken';
        break;
      case 'dispute_raised':
        icon = ShieldAlert;
        color = 'text-rose-600';
        bg = 'bg-rose-100';
        title = 'Dispute Raised';
        break;
      case 'booking_logged':
        icon = DollarSign;
        color = 'text-[#18452E]';
        bg = 'bg-[#18452E]/10';
        title = 'New Booking Logged';
        break;
      case 'remittance_submitted':
        icon = CheckCircle;
        color = 'text-emerald-600';
        bg = 'bg-emerald-100';
        title = 'Remittance Disbursed';
        break;
      case 'complaint_status_changed':
        icon = Wrench;
        color = 'text-amber-600';
        bg = 'bg-amber-100';
        title = 'Complaint Status Changed';
        break;
      case 'document_uploaded':
        icon = MessageSquare;
        color = 'text-teal-700';
        bg = 'bg-teal-50';
        title = 'Document Uploaded';
        break;
      case 'rent_reminder':
        icon = Bell;
        color = 'text-blue-600';
        bg = 'bg-blue-50';
        title = 'Automated Rent Reminder';
        break;
      case 'broadcast':
        icon = Bell;
        color = 'text-[#18452E]';
        bg = 'bg-[#18452E]/10';
        title = 'Platform Announcement';
        break;
      case 'lease_renewal_alert':
        icon = MessageSquare;
        color = 'text-#6B7280';
        bg = 'bg-stone-50';
        title = 'Lease Renewal Alert';
        break;
      case 'damage_report':
        icon = AlertTriangle;
        color = 'text-amber-600';
        bg = 'bg-amber-100';
        title = 'Damage Report Logged';
        break;
      case 'maintenance_update':
        icon = Wrench;
        color = 'text-[#18452E]';
        bg = 'bg-[#18452E]/10';
        title = 'Maintenance Update';
        break;
      case 'quit_notice':
        icon = AlertTriangle;
        color = 'text-rose-600';
        bg = 'bg-rose-100';
        title = 'Quit Notice Initiated';
        break;
      case 'subscription_renewal':
        icon = DollarSign;
        color = 'text-[#18452E]';
        bg = 'bg-stone-50';
        title = 'Subscription Renewal';
        break;
      case 'admin_action':
        icon = UserCheck;
        color = 'text-#6B7280';
        bg = 'bg-stone-50';
        title = 'Admin Action Cleared';
        break;
    }

    let timeStr = 'Recently';
    try {
      const diff = Date.now() - new Date(n.timestamp).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) timeStr = 'Just now';
      else if (mins < 60) timeStr = `${mins} mins ago`;
      else if (mins < 1440) timeStr = `${Math.floor(mins / 60)} hours ago`;
      else timeStr = new Date(n.timestamp).toLocaleDateString();
    } catch {}

    return {
      id: n.id,
      type: n.type,
      title: title,
      message: n.message,
      time: timeStr,
      icon,
      color,
      bg,
      unread: !n.read,
      date: new Date(n.timestamp),
      channels: n.channels || ['In-App', 'Email']
    };
  });

  const filteredNotifications = mappedNotifications.filter(n => {
    if (activeFilter === 'Archived') return archivedIds.includes(n.id);
    if (archivedIds.includes(n.id)) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return n.unread;
    if (activeFilter === 'Today') {
      return new Date().toDateString() === n.date.toDateString();
    }
    if (activeFilter === 'This Week') {
      const diff = Date.now() - n.date.getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }
    if (activeFilter === 'Payments') {
      return n.type === 'payment_confirmed' || n.type === 'remittance_submitted' || n.type === 'rent_reminder';
    }
    if (activeFilter === 'Maintenance') {
      return n.type === 'complaint_status_changed' || n.type === 'damage_report' || n.type === 'maintenance_update';
    }
    if (activeFilter === 'Leases') {
      return n.type === 'lease_renewal_alert' || n.type === 'quit_notice';
    }
    
    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id);
    const bPinned = pinnedIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return b.date.getTime() - a.date.getTime();
  });

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-#132A1D/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-sm flex flex-col animate-fade-in-right">
        <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-[#18452E] text-white">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 animate-pulse" />
            <h2 className="font-display font-bold">Live Activity Feed</h2>
          </div>
          <div className="flex items-center space-x-2">
            {liveNotifications.some(n => !n.read) && (
              <button 
                onClick={handleMarkAllAsRead} 
                className="text-[9px] font-bold uppercase bg-[#C9A84C] text-[#18452E] px-2 py-1 rounded hover:bg-[#C9A84C]/90 transition"
              >
                Mark All Read
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Filter Bar */}
        <div className="bg-white border-b border-stone-200 py-2 px-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex space-x-1">
            {filterTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                  activeFilter === tab ? 'bg-[#C9A84C] text-[#18452E]' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
          {sortedNotifications.length === 0 ? (
            <div className="text-center p-8 text-stone-400 text-xs italic">
              No notifications found for this filter.
            </div>
          ) : (
            sortedNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`bg-white border ${pinnedIds.includes(notif.id) ? 'border-[#C9A84C]' : 'border-stone-200'} p-4 rounded-2xl flex items-start space-x-3 shadow-sm relative ${notif.unread ? 'bg-amber-50/20' : ''}`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${notif.bg}`}>
                  <notif.icon className={`w-5 h-5 ${notif.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-xs font-bold text-#132A1D flex items-center">
                        {pinnedIds.includes(notif.id) && <Pin className="w-3 h-3 mr-1 text-[#C9A84C]" />}
                        {notif.title}
                      </h4>
                      {notif.unread && (
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                      )}
                    </div>
                    <div className="relative flex items-center space-x-1">
                      {notif.unread && (
                        <button 
                          onClick={() => handleMarkAsRead(notif.id)} 
                          className="text-[9px] text-[#18452E] font-bold uppercase hover:underline mr-1"
                        >
                          Mark Read
                        </button>
                      )}
                      <button onClick={() => setOpenMenuId(openMenuId === notif.id ? null : notif.id)} className="p-1 hover:bg-stone-50 rounded">
                        <MoreHorizontal className="w-4 h-4 text-stone-400" />
                      </button>
                      {openMenuId === notif.id && (
                        <div className="absolute right-0 mt-6 w-36 bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden z-10">
                          <button onClick={() => handlePin(notif.id)} className="w-full text-left px-4 py-2 text-[10px] uppercase font-bold text-#6B7280 hover:bg-stone-50 flex items-center">
                            <Pin className="w-3 h-3 mr-2" /> {pinnedIds.includes(notif.id) ? 'Unpin' : 'Pin This'}
                          </button>
                          <button onClick={() => handleArchive(notif.id)} className="w-full text-left px-4 py-2 text-[10px] uppercase font-bold text-#6B7280 hover:bg-stone-50 flex items-center">
                            <Archive className="w-3 h-3 mr-2" /> {archivedIds.includes(notif.id) ? 'Unarchive' : 'Archive'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-#6B7280 mt-1 leading-relaxed">{notif.message}</p>
                  
                  {/* Channels visual confirmation */}
                  {notif.channels && notif.channels.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[8px] font-bold text-stone-400 uppercase font-mono">Via:</span>
                      {notif.channels.map(ch => (
                        <span key={ch} className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded bg-stone-50 text-#6B7280 border border-stone-200/60 font-mono">
                          {ch}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] font-mono font-bold text-stone-400 block mt-2">{notif.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
