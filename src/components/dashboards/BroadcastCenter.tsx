// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Send, Mail, RefreshCw, Eye, History, Sparkles, Users, X, Clock, AlertTriangle
} from 'lucide-react';
import { LandlordUnit, Property } from '../../types';
import { triggerNotificationCloudEvent } from '../../lib/database';

interface BroadcastCenterProps {
  landlordUnits: LandlordUnit[];
  properties: Property[];
  triggerSuccess: (msg: string) => void;
}

interface SentBroadcast {
  id: string;
  title: string;
  segment: string;
  message: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  channels: ('In-App' | 'Email')[];
  date: string;
  status: 'Delivered' | 'Pending' | 'Scheduled';
  recipientsCount: number;
  isScheduled: boolean;
  scheduleTime?: string;
}

const STORAGE_KEY = 'uh_broadcasts_history_pmc_v1';

export default function BroadcastCenter({
  landlordUnits,
  properties,
  triggerSuccess
}: BroadcastCenterProps) {
  // Scope to PMC's managed portfolio only
  const pmcProperties = properties.filter(p => !p.managementCompanyId || p.managementCompanyId === 'Prime Property Solutions');
  const pmcUnits = landlordUnits.filter(u => {
    const prop = properties.find(p => p.title === u.propertyName);
    return !prop || !prop.managementCompanyId || prop.managementCompanyId === 'Prime Property Solutions' || u.managementCompanyId === 'Prime Property Solutions';
  });

  const [bcastTitle, setBcastTitle] = useState('');
  const [bcastMessage, setBcastMessage] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [segment, setSegment] = useState<'All Tenants' | 'All Tenants in Building' | 'Defaulters Only' | 'All Landlords'>('All Tenants');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  
  // Scheduling States
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [sentBroadcasts, setSentBroadcasts] = useState<SentBroadcast[]>([]);

  // Load sent broadcasts
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSentBroadcasts(JSON.parse(stored));
      } else {
        const initial: SentBroadcast[] = [
          { 
            id: 'bc-1', 
            title: 'Overdue Levy Warning',
            segment: 'Defaulters Only', 
            message: 'Urgent notice: your rent is overdue. Please settle your payment.', 
            urgency: 'Urgent',
            channels: ['In-App', 'Email'], 
            date: '2026-07-12', 
            status: 'Delivered', 
            recipientsCount: 3, 
            isScheduled: false 
          },
          { 
            id: 'bc-2', 
            title: 'Water Main Maintenance',
            segment: 'All Tenants', 
            message: 'Routine water main inspection scheduled for this Saturday.', 
            urgency: 'Medium',
            channels: ['In-App', 'Email'], 
            date: '2026-07-10', 
            status: 'Delivered', 
            recipientsCount: 8, 
            isScheduled: false 
          }
        ];
        setSentBroadcasts(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync state helpers
  const buildings = Array.from(new Set(pmcProperties.map(p => p.title)));

  // Pick first tenant in segment for live preview substitution
  const getPreviewData = () => {
    let matchedUnit: LandlordUnit | undefined;

    if (segment === 'Defaulters Only') {
      matchedUnit = pmcUnits.find(u => u.paymentStatus === 'Overdue');
    } else if (segment === 'All Tenants in Building' && selectedBuilding) {
      matchedUnit = pmcUnits.find(u => u.propertyName === selectedBuilding);
    } else {
      matchedUnit = pmcUnits.find(u => u.paymentStatus !== 'Vacant');
    }

    if (!matchedUnit) {
      matchedUnit = pmcUnits[0];
    }

    return {
      tenantName: matchedUnit?.tenantName || 'Adewale Okafor',
      propertyName: matchedUnit?.propertyName || 'Eko Atlantic Apartment',
      amountDue: matchedUnit?.paymentStatus === 'Overdue' ? `₦${matchedUnit.rentAmount.toLocaleString()}` : '₦0',
      landlordName: 'Prime Property Solutions'
    };
  };

  const renderPreviewMessage = () => {
    const previewData = getPreviewData();
    let preview = bcastMessage || '(No message content entered)';
    preview = preview.replace(/{tenantName}/g, previewData.tenantName);
    preview = preview.replace(/{propertyName}/g, previewData.propertyName);
    preview = preview.replace(/{amountDue}/g, previewData.amountDue);
    preview = preview.replace(/{landlordName}/g, previewData.landlordName);
    return preview;
  };

  const getTargetedRecipients = () => {
    if (segment === 'All Tenants') {
      return pmcUnits.filter(u => u.paymentStatus !== 'Vacant');
    }
    if (segment === 'Defaulters Only') {
      return pmcUnits.filter(u => u.paymentStatus === 'Overdue');
    }
    if (segment === 'All Tenants in Building') {
      return pmcUnits.filter(u => u.propertyName === selectedBuilding && u.paymentStatus !== 'Vacant');
    }
    if (segment === 'All Landlords') {
      // Return list of unique landlord names associated with the PMC units
      const landlordsSet = new Set(pmcUnits.map(u => {
        const prop = properties.find(p => p.title === u.propertyName);
        return prop?.landlordName || 'Mrs. Adunola Fashola';
      }));
      return Array.from(landlordsSet).map(name => ({ tenantName: name, propertyName: 'Managed Property', id: name }));
    }
    return [];
  };

  const handleSendBroadcast = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bcastTitle.trim()) {
      alert('Broadcast Title is required.');
      return;
    }
    if (!bcastMessage.trim()) {
      alert('Message body is required.');
      return;
    }

    const recipients = getTargetedRecipients();
    if (recipients.length === 0) {
      alert('Selected target segment has zero active subscribers in your managed portfolio.');
      return;
    }

    const recipientCount = recipients.length;
    const broadcastId = 'bc-' + Date.now();

    // Map recipients to unified notification targets
    const addressedTo = recipients.map(r => {
      const role = segment === 'All Landlords' ? 'Landlord' : 'Tenant';
      // In a real environment, we'd lookup targetId. Here we generate or use names.
      const targetId = segment === 'All Landlords' ? 'UH-LANDLORD-FUNMI' : 'UH-TENANT-AISHA';
      return { role, targetId };
    });

    // Send via triggerNotificationCloudEvent (creates one doc per recipient under 'notifications')
    // Rules mandate: In-App & Email only! Never WhatsApp or SMS for broadcasts.
    triggerNotificationCloudEvent(
      'broadcast',
      `[${urgency} Broadcast] ${bcastTitle}: ${bcastMessage}`,
      broadcastId,
      addressedTo,
      ['In-App', 'Email']
    );

    const newBroadcast: SentBroadcast = {
      id: broadcastId,
      title: bcastTitle,
      segment: segment === 'All Tenants in Building' ? `${segment} (${selectedBuilding})` : segment,
      message: renderPreviewMessage(),
      urgency,
      channels: ['In-App', 'Email'],
      date: new Date().toISOString().split('T')[0],
      status: scheduleLater ? 'Scheduled' : 'Delivered',
      recipientsCount: recipientCount,
      isScheduled: scheduleLater,
      scheduleTime: scheduleLater ? scheduleTime : undefined
    };

    const updated = [newBroadcast, ...sentBroadcasts];
    setSentBroadcasts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    triggerSuccess(
      scheduleLater
        ? `PMC Broadcast "${bcastTitle}" successfully scheduled for ${scheduleTime} targeting ${recipientCount} recipients via In-App and Email channels!`
        : `PMC Broadcast "${bcastTitle}" successfully dispatched to ${recipientCount} managed recipients via In-App and Email channels!`
    );

    // Reset fields
    setBcastTitle('');
    setBcastMessage('');
    setScheduleLater(false);
    setScheduleTime('');
    setShowPreviewModal(false);
  };

  const handleInsertTag = (tag: string) => {
    setBcastMessage(prev => prev + tag);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
      {/* Overview stats panel to establish design context */}
      <div className="bg-teal-50 border border-teal-100 p-4 rounded-[var(--radius-large)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="font-display font-black text-teal-950 uppercase text-xs">PMC Scoped Portfolios</h4>
          <p className="text-[11px] text-teal-800 font-light">
            Broadcasting as **Prime Property Solutions**. Your broadcasts are strictly scoped to your **{pmcProperties.length} managed buildings** and **{pmcUnits.length} active rental units**.
          </p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-full border border-teal-100 text-[10px] font-mono font-bold text-teal-900 flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5 text-teal-800 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Real-time Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COMPOSE VIEW */}
        <div className="lg:col-span-7 bg-white border border-teal-100 rounded-[var(--radius-large)] p-6 space-y-5 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-stone-200 pb-3">
            <Megaphone className="w-5 h-5 text-teal-800" />
            <h3 className="font-display font-black text-teal-950 uppercase text-sm">PMC Active Broadcast Portal</h3>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setShowPreviewModal(true); }} className="space-y-4">
            {/* TITLE HEADER */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase">Broadcast Title (100 Chars Limit)</label>
              <input
                type="text"
                required
                maxLength={100}
                value={bcastTitle}
                onChange={(e) => setBcastTitle(e.target.value)}
                placeholder="e.g. Schedule for water treatment service"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-700 text-teal-950 font-bold"
              />
              <span className="text-[9px] text-stone-400 font-mono block text-right">
                {100 - bcastTitle.length} characters remaining
              </span>
            </div>

            {/* SEGMENT & URGENCY SELECTION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Target Recipient Group</label>
                <select
                  value={segment}
                  onChange={(e: any) => setSegment(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none text-teal-950"
                >
                  <option value="All Tenants">All Managed Tenants</option>
                  <option value="All Tenants in Building">All Tenants in Building</option>
                  <option value="Defaulters Only">Defaulters Only</option>
                  <option value="All Landlords">All Managed Landlords</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Urgency Level</label>
                <select
                  value={urgency}
                  onChange={(e: any) => setUrgency(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold outline-none text-teal-950"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent / Critical</option>
                </select>
              </div>
            </div>

            {/* CONDITIONAL BUILDING SPECIFICATION */}
            {segment === 'All Tenants in Building' && (
              <div className="animate-fade-in">
                <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Specify Target Building</label>
                <select
                  required
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none font-bold"
                >
                  <option value="">-- Choose Managed Building --</option>
                  {buildings.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {/* MESSAGE COMPOSER */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase">Message Body (500 Chars Limit)</label>
                
                {/* MERGE TAGS SELECTOR */}
                <div className="flex items-center space-x-1">
                  <span className="text-[8px] font-mono font-black text-teal-900 bg-teal-50 px-1.5 py-0.5 rounded uppercase">Merge Tags:</span>
                  {['{tenantName}', '{propertyName}', '{amountDue}', '{landlordName}'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInsertTag(tag)}
                      className="px-1.5 py-0.5 border border-stone-200 hover:border-teal-300 rounded font-mono text-[9px] bg-stone-50 text-#6B7280 transition cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                required
                maxLength={500}
                rows={4}
                value={bcastMessage}
                onChange={(e) => setBcastMessage(e.target.value)}
                className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono outline-none focus:border-teal-700 leading-relaxed"
                placeholder="Type your broadcast announcement body. Use the merge tags to personalize details automatically."
              />
              <span className="text-[9px] text-stone-400 font-mono block text-right">
                {500 - bcastMessage.length} characters remaining
              </span>
            </div>

            {/* SCHEDULING ENGINE */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="block text-teal-950 text-xs font-bold">Schedule Delivery</strong>
                  <span className="text-[10px] text-stone-400 block font-light">Delay dispatch to a targeted date and time</span>
                </div>
                <input
                  type="checkbox"
                  checked={scheduleLater}
                  onChange={(e) => setScheduleLater(e.target.checked)}
                  className="w-4 h-4 text-teal-800 accent-teal-800 cursor-pointer"
                />
              </div>

              {scheduleLater && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase">Target Dispatch Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none font-mono"
                  />
                </div>
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-[10px] text-stone-400 font-mono">
                Targeting: <strong className="text-teal-900">{getTargetedRecipients().length} recipients</strong>
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-4 py-2.5 border border-stone-200 bg-stone-50 hover:bg-stone-50 text-#132A1D font-bold rounded-xl flex items-center space-x-1 transition cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Broadcast</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl flex items-center space-x-1.5 transition cursor-pointer shadow-sm uppercase tracking-wider text-[10px]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Launch Broadcast</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* COMPLIANCE CHECKLIST BAR */}
        <div className="lg:col-span-5 bg-stone-50 border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4 shadow-inner">
          <div className="flex items-center space-x-1.5 text-#6B7280 border-b border-stone-200 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h4 className="font-display font-black text-#132A1D uppercase text-xs">Compliance Routing Rules</h4>
          </div>

          <div className="space-y-3 text-xs text-#6B7280 font-light leading-relaxed">
            <p>
              Under platform guideline mandates, general broadcasts are restricted to **In-App Portal Notification** and **HTML Email** channels only.
            </p>
            <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-1 font-mono text-[10px]">
              <div className="flex items-center text-emerald-800">
                <span className="mr-1">✓</span>
                <span>In-App Delivery Enabled</span>
              </div>
              <div className="flex items-center text-emerald-800">
                <span className="mr-1">✓</span>
                <span>HTML Email Dispatches Enabled</span>
              </div>
              <div className="flex items-center text-rose-500 line-through">
                <span className="mr-1">✗</span>
                <span>WhatsApp Gateway (Restricted to Rent Reminders)</span>
              </div>
              <div className="flex items-center text-rose-500 line-through">
                <span className="mr-1">✗</span>
                <span>SMS Push Gateway (Restricted to Rent Reminders)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Broadcast Sent History Logs */}
      <div className="bg-white border border-teal-100 rounded-[var(--radius-large)] p-6 space-y-4 shadow-xs">
        <div className="flex items-center space-x-1.5 text-teal-950 border-b border-stone-200 pb-3">
          <History className="w-4 h-4 text-teal-850" />
          <h4 className="font-display font-black text-teal-950 uppercase text-xs">Recent Scoped Broadcast Dispatches</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[9px] font-mono text-stone-400 uppercase tracking-wider">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Title</th>
                <th className="py-2.5">Segment</th>
                <th className="py-2.5 text-center">Urgency</th>
                <th className="py-2.5">Message Snippet</th>
                <th className="py-2.5 text-center">Size</th>
                <th className="py-2.5 text-center">Channels</th>
              </tr>
            </thead>
            <tbody>
              {sentBroadcasts.map((bc) => (
                <tr key={bc.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                  <td className="py-3 font-mono text-#6B7280">{bc.date}</td>
                  <td className="py-3 font-bold text-teal-950">{bc.title}</td>
                  <td className="py-3 text-#6B7280 font-bold">{bc.segment}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                      bc.urgency === 'Urgent' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                      bc.urgency === 'High' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                      'bg-stone-50 text-#6B7280 border border-stone-200'
                    }`}>
                      {bc.urgency}
                    </span>
                  </td>
                  <td className="py-3 text-#6B7280 font-light max-w-[200px] truncate" title={bc.message}>
                    {bc.message}
                  </td>
                  <td className="py-3 text-center font-bold font-mono text-teal-950">{bc.recipientsCount} recs</td>
                  <td className="py-3 text-center">
                    <div className="flex justify-center gap-1">
                      {bc.channels.map(ch => (
                        <span key={ch} className="px-1.5 py-0.5 bg-stone-50 rounded font-mono text-[9px] text-#6B7280 border border-stone-250">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-sm">
          <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full overflow-hidden flex flex-col shadow-sm animate-scale-up border border-stone-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-teal-800 text-white">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5" />
                <span className="font-display font-bold uppercase">Broadcast Gateway Preview</span>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 rounded-full hover:bg-white/20 transition-all text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 bg-stone-50">
              <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-center text-[10px]">
                  <span className={`px-2 py-0.5 rounded-full font-extrabold uppercase ${
                    urgency === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                    urgency === 'High' ? 'bg-amber-100 text-amber-800' :
                    'bg-stone-50 text-#6B7280'
                  }`}>
                    Urgency: {urgency}
                  </span>
                  <span className="text-stone-400 font-mono font-bold uppercase">
                    Target: {segment}
                  </span>
                </div>
                
                <h4 className="font-bold text-teal-950 text-sm border-b border-stone-200 pb-2">{bcastTitle || '(No title entered)'}</h4>
                
                <div className="text-xs text-#132A1D leading-relaxed space-y-2">
                  <p className="font-mono bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                    {renderPreviewMessage()}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 mt-2 text-[9px] font-mono text-stone-400">
                  <span>Routing Channels:</span>
                  <span className="px-1.5 bg-stone-50 text-#6B7280 rounded border border-stone-250">In-App</span>
                  <span className="px-1.5 bg-stone-50 text-#6B7280 rounded border border-stone-250">Email</span>
                  <span className="text-rose-500 line-through px-1 font-bold">WhatsApp/SMS Restricted</span>
                </div>
              </div>

              {scheduleLater && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-mono flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span><strong>Scheduled Dispatch:</strong> {scheduleTime || 'Not set'}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-#132A1D font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                onClick={() => handleSendBroadcast()}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Confirm &amp; Launch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
