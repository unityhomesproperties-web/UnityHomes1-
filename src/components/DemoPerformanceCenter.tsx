import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { 
  Activity, ArrowRight, ShieldCheck, ChevronRight, BarChart2, TrendingUp, Users, Building, AlertTriangle, CheckCircle2,
  DollarSign, FileText, Settings, Layers, Calendar, Clock, Lock, RefreshCw
} from 'lucide-react';

const COLORS = ['#18452E', '#6FBE45', '#0E2F1F', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface DemoPerformanceCenterProps {
  navigate: (path: string, params?: any) => void;
}

export default function DemoPerformanceCenter({ navigate }: DemoPerformanceCenterProps) {
  const [activeTab, setActiveTab] = useState<'Landlord' | 'Tenant' | 'PMC' | 'ShortletLandlord' | 'ShortletManager' | 'Admin'>('Landlord');

  // MOCK DATA GENERATION
  const revenueData = [
    { name: 'Jan', revenue: 3000000, expected: 3200000 },
    { name: 'Feb', revenue: 3300000, expected: 3400000 },
    { name: 'Mar', revenue: 3600000, expected: 3600000 },
    { name: 'Apr', revenue: 3500000, expected: 3700000 },
    { name: 'May', revenue: 4200000, expected: 4200000 },
    { name: 'Jun', revenue: 5000000, expected: 5200000 },
  ];

  const occupancyData = [
    { name: 'Jan', rate: 82 },
    { name: 'Feb', rate: 85 },
    { name: 'Mar', rate: 88 },
    { name: 'Apr', rate: 87 },
    { name: 'May', rate: 92 },
    { name: 'Jun', rate: 95 },
  ];

  const collectionData = [
    { name: 'Q1', collected: 90, outstanding: 10 },
    { name: 'Q2', collected: 95, outstanding: 5 },
    { name: 'Q3', collected: 92, outstanding: 8 },
    { name: 'Q4', collected: 98, outstanding: 2 },
  ];

  const maintenanceData = [
    { name: 'Jan', requests: 12, resolved: 10 },
    { name: 'Feb', requests: 15, resolved: 14 },
    { name: 'Mar', requests: 8, resolved: 8 },
    { name: 'Apr', requests: 20, resolved: 15 },
    { name: 'May', requests: 18, resolved: 18 },
    { name: 'Jun', requests: 10, resolved: 9 },
  ];

  const damageCostData = [
    { name: 'Q1', cost: 150000 },
    { name: 'Q2', cost: 280000 },
    { name: 'Q3', cost: 120000 },
    { name: 'Q4', cost: 350000 },
  ];

  const bookingData = [
    { name: 'Week 1', bookings: 25, revenue: 250000 },
    { name: 'Week 2', bookings: 30, revenue: 300000 },
    { name: 'Week 3', bookings: 28, revenue: 280000 },
    { name: 'Week 4', bookings: 40, revenue: 400000 },
  ];

  // Portfolio Health Score Logic
  const healthMetrics = {
    occupancy: 95, // out of 100
    collectionRate: 92, // out of 100
    outstandingRent: 8, // out of 100 (inverse, low is good)
    maintenanceSpeed: 90, // out of 100
    damageFrequency: 15, // out of 100 (inverse)
    bookingPerformance: 88, // out of 100
  };

  // Calculate weighted score
  const healthScore = Math.round(
    (healthMetrics.occupancy * 0.25) +
    (healthMetrics.collectionRate * 0.25) +
    ((100 - healthMetrics.outstandingRent) * 0.15) +
    (healthMetrics.maintenanceSpeed * 0.15) +
    ((100 - healthMetrics.damageFrequency) * 0.1) +
    (healthMetrics.bookingPerformance * 0.1)
  );

  const getHealthStatus = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-200' };
    if (score >= 75) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' };
    if (score >= 60) return { label: 'Needs Attention', color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200' };
    return { label: 'Critical', color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-200' };
  };

  const status = getHealthStatus(healthScore);

  const tabs = [
    { id: 'Landlord', label: 'Landlord' },
    { id: 'Tenant', label: 'Tenant' },
    { id: 'PMC', label: 'Property Manager' },
    { id: 'ShortletLandlord', label: 'Shortlet Landlord' },
    { id: 'ShortletManager', label: 'Shortlet Manager' },
    { id: 'Admin', label: 'Platform Admin' }
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 md:px-8 w-full">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="bg-[#18452E] text-white rounded-[var(--radius-large)] p-8 md:p-12 mb-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity className="w-64 h-64 text-[#6FBE45]" />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-mono font-semibold tracking-widest text-[#6FBE45] bg-[#6FBE45]/10 px-3 py-1.5 rounded-full border border-[#6FBE45]/20">
              Interactive Value Sandbox
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-semibold mt-4 leading-tight">
              Unity Performance Center
            </h1>
            <p className="text-stone-300 max-w-2xl mt-4 font-normal leading-relaxed">
              Experience the power of the Unity Homes Operating System before you subscribe. This simulated environment showcases the exact analytics, insights, and workflows available to our premium partners.
            </p>
            
            {/* DATASET SUMMARY PILLS */}
            <div className="flex flex-wrap gap-3 mt-8">
              {['5 Landlords', '30+ Properties', '120+ Units', '60+ Tenants', '2 PMCs', '4 Shortlet Managers', '15 Shortlet Apartments', '300+ Transactions', '40+ Service Charges', '20+ Maintenance Records', '20+ Damage Reports'].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#6FBE45]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HEALTH SCORE HERO CARD */}
        <div className="bg-white rounded-[var(--radius-large)] p-8 border border-stone-200 shadow-sm mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 text-center lg:text-left border-b lg:border-b-0 lg:border-r border-stone-200 pb-8 lg:pb-0 lg:pr-8">
              <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-stone-400 mb-2">Proprietary Metric</h2>
              <h3 className="text-2xl font-display font-semibold text-[#18452E] mb-6">Portfolio Health Score</h3>
              
              <div className="relative inline-block">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-stone-100" />
                  <circle 
                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    strokeDasharray={440} strokeDashoffset={440 - (440 * healthScore) / 100} 
                    className={`${status.color} transition-all duration-1000 ease-out`} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-display font-semibold text-[#18452E]">{healthScore}</span>
                  <span className="text-[10px] font-mono font-semibold text-stone-400">/ 100</span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center lg:justify-start">
                <span className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${status.bg} ${status.border} ${status.color}`}>
                  Status: {status.label}
                </span>
              </div>
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Occupancy Rate', value: `${healthMetrics.occupancy}%`, icon: Building },
                { label: 'Collection Rate', value: `${healthMetrics.collectionRate}%`, icon: DollarSign },
                { label: 'Outstanding Rent', value: `${healthMetrics.outstandingRent}%`, icon: AlertTriangle, inverse: true },
                { label: 'Maintenance Speed', value: `${healthMetrics.maintenanceSpeed}/100`, icon: Settings },
                { label: 'Damage Frequency', value: `${healthMetrics.damageFrequency}%`, icon: ShieldCheck, inverse: true },
                { label: 'Booking Perf.', value: `${healthMetrics.bookingPerformance}/100`, icon: Calendar },
              ].map((metric, idx) => (
                <div key={idx} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <metric.icon className="w-5 h-5 text-[#6FBE45]" />
                  </div>
                  <span className="text-2xl font-display font-semibold text-[#18452E]">{metric.value}</span>
                  <span className="text-[10px] font-mono font-semibold text-#6B7280 uppercase tracking-wider mt-1">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROLE-BASED DASHBOARD PREVIEWS */}
        <div className="bg-white rounded-[var(--radius-large)] border border-stone-200 shadow-sm overflow-hidden mb-12">
          
          <div className="flex overflow-x-auto bg-[#F0F8F4] border-b border-stone-200 p-2 hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#18452E] text-white shadow-md' 
                    : 'text-#6B7280 hover:bg-stone-200/50 hover:text-[#18452E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            
            {activeTab === 'Landlord' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-display font-semibold text-[#18452E]">Landlord Intelligence</h2>
                    <p className="text-#6B7280 text-sm mt-1">Track portfolio growth, occupancy, and collection efficiency.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                    <h3 className="font-display font-semibold text-sm uppercase text-[#18452E] mb-4">Revenue Growth vs Expected</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8E4" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(val) => `₦${val/1000000}m`} />
                          <RechartsTooltip formatter={(val: number) => `₦${val.toLocaleString()}`} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="revenue" fill="#18452E" radius={[4, 4, 0, 0]} name="Actual Revenue" />
                          <Line type="monotone" dataKey="expected" stroke="#6FBE45" strokeWidth={3} name="Expected Revenue" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                    <h3 className="font-display font-semibold text-sm uppercase text-[#18452E] mb-4">Occupancy Trends</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={occupancyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8E4" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} domain={[0, 100]} />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="rate" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Occupancy %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="bg-[#18452E] text-white p-5 rounded-2xl">
                       <span className="block text-[10px] font-mono text-[#6FBE45] uppercase mb-1">Rent Collection Rate</span>
                       <span className="text-3xl font-display font-semibold">94.5%</span>
                     </div>
                     <div className="bg-white border border-stone-200 p-5 rounded-2xl">
                       <span className="block text-[10px] font-mono text-#6B7280 uppercase mb-1">Outstanding Rent</span>
                       <span className="text-3xl font-display font-semibold text-rose-600">₦1.2m</span>
                     </div>
                     <div className="bg-white border border-stone-200 p-5 rounded-2xl">
                       <span className="block text-[10px] font-mono text-#6B7280 uppercase mb-1">Service Charges</span>
                       <span className="text-3xl font-display font-semibold text-emerald-600">100%</span>
                     </div>
                     <div className="bg-white border border-stone-200 p-5 rounded-2xl">
                       <span className="block text-[10px] font-mono text-#6B7280 uppercase mb-1">Property Ranking</span>
                       <span className="text-3xl font-display font-semibold text-[#18452E]">Top 5%</span>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Tenant' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-display font-semibold text-[#18452E]">Tenant Experience</h2>
                  <p className="text-#6B7280 text-sm mt-1">Seamless payment tracking, issue resolution, and document security.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
                    <DollarSign className="w-10 h-10 text-emerald-600 mb-4" />
                    <h3 className="font-display font-semibold text-lg text-[#18452E]">Payment Tracking</h3>
                    <p className="text-xs text-#6B7280 mt-2">Zero disputes. Digital receipts and ledger matching guarantee your payments are instantly recognized by landlords.</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                    <Lock className="w-10 h-10 text-blue-600 mb-4" />
                    <h3 className="font-display font-semibold text-lg text-[#18452E]">Document Vault</h3>
                    <p className="text-xs text-#6B7280 mt-2">Secure access to tenancy agreements, house rules, and KYC data. Protected by robust cloud encryption.</p>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex flex-col items-center text-center">
                    <AlertTriangle className="w-10 h-10 text-amber-600 mb-4" />
                    <h3 className="font-display font-semibold text-lg text-[#18452E]">Complaint Management</h3>
                    <p className="text-xs text-#6B7280 mt-2">Log issues directly to the property manager. Track resolution times and ensure your voice is heard.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'PMC' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-display font-semibold text-[#18452E]">PMC Command Center</h2>
                  <p className="text-#6B7280 text-sm mt-1">Manage vast multi-landlord portfolios and optimize collection performance.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                     <h3 className="font-display font-semibold text-sm uppercase text-[#18452E] mb-4">Collection Performance (Quarterly)</h3>
                     <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={collectionData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8E4" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                           <RechartsTooltip />
                           <Legend wrapperStyle={{ fontSize: 10 }} />
                           <Bar dataKey="collected" stackId="a" fill="#18452E" name="Collected %" />
                           <Bar dataKey="outstanding" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} name="Outstanding %" />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                     <h3 className="font-display font-semibold text-sm uppercase text-[#18452E] mb-4">Maintenance Resolution Velocity</h3>
                     <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={maintenanceData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8E4" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                           <RechartsTooltip />
                           <Legend wrapperStyle={{ fontSize: 10 }} />
                           <Area type="monotone" dataKey="requests" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} name="Requests Logged" />
                           <Area type="monotone" dataKey="resolved" stroke="#10B981" fill="#10B981" fillOpacity={0.4} name="Requests Resolved" />
                         </AreaChart>
                       </ResponsiveContainer>
                     </div>
                  </div>
                  
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 border border-stone-200 rounded-xl bg-white flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-#6B7280 uppercase">Multi-Landlord Portfolio</span>
                        <span className="text-xl font-semibold text-[#18452E]">12 Active Owners</span>
                      </div>
                      <Users className="w-8 h-8 text-[#6FBE45]" />
                    </div>
                    <div className="p-4 border border-stone-200 rounded-xl bg-white flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-#6B7280 uppercase">Tenant Management</span>
                        <span className="text-xl font-semibold text-[#18452E]">84 Active Tenants</span>
                      </div>
                      <Building className="w-8 h-8 text-[#6FBE45]" />
                    </div>
                    <div className="p-4 border border-stone-200 rounded-xl bg-white flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-#6B7280 uppercase">Report Generation</span>
                        <span className="text-xl font-semibold text-[#18452E]">Automated</span>
                      </div>
                      <FileText className="w-8 h-8 text-[#6FBE45]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ShortletLandlord' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-display font-semibold text-[#18452E]">Shortlet Owner Insights</h2>
                  <p className="text-#6B7280 text-sm mt-1">Track high-yield shortlet performance, manager metrics, and asset protection.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                    <h3 className="font-display font-semibold text-sm uppercase text-[#18452E] mb-4">Booking Revenue Trajectory</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={bookingData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8E4" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => `₦${v/1000}k`} />
                          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                          <RechartsTooltip />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar yAxisId="left" dataKey="revenue" fill="#0E2F1F" radius={[4, 4, 0, 0]} name="Revenue (₦)" />
                          <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#6FBE45" strokeWidth={3} name="Bookings Count" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                    <h3 className="font-display font-semibold text-sm uppercase text-[#18452E] mb-4">Damage Cost Impact</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={damageCostData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8E4" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => `₦${v/1000}k`} />
                          <RechartsTooltip />
                          <Bar dataKey="cost" fill="#EF4444" radius={[4, 4, 0, 0]} name="Repair Costs" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-wrap gap-4">
                    <div className="flex-1 bg-white border border-stone-200 p-4 rounded-xl text-center">
                      <span className="block text-[10px] font-mono text-#6B7280 uppercase">Manager Performance</span>
                      <span className="text-lg font-semibold text-[#18452E]">98% Response Rate</span>
                    </div>
                    <div className="flex-1 bg-white border border-stone-200 p-4 rounded-xl text-center">
                      <span className="block text-[10px] font-mono text-#6B7280 uppercase">Remittance Tracking</span>
                      <span className="text-lg font-semibold text-[#18452E]">Automated Splits</span>
                    </div>
                    <div className="flex-1 bg-white border border-stone-200 p-4 rounded-xl text-center">
                      <span className="block text-[10px] font-mono text-#6B7280 uppercase">Total Revenue</span>
                      <span className="text-lg font-semibold text-emerald-600">₦6.15m MTD</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ShortletManager' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-display font-semibold text-[#18452E]">Manager Operations</h2>
                  <p className="text-#6B7280 text-sm mt-1">Streamline bookings, calc commissions, and handle incident reports efficiently.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                    <Calendar className="w-10 h-10 text-[#18452E] mb-3" />
                    <h3 className="font-semibold text-[#18452E]">Booking Logging</h3>
                    <p className="text-[11px] text-#6B7280 mt-2">Log guest stays rapidly with auto-synced calendars.</p>
                  </div>
                  <div className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                    <DollarSign className="w-10 h-10 text-[#6FBE45] mb-3" />
                    <h3 className="font-semibold text-[#18452E]">Commission Calc</h3>
                    <p className="text-[11px] text-#6B7280 mt-2">Instant split calculations based on pre-agreed landlord percentages.</p>
                  </div>
                  <div className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                    <RefreshCw className="w-10 h-10 text-blue-500 mb-3" />
                    <h3 className="font-semibold text-[#18452E]">Remittance Flow</h3>
                    <p className="text-[11px] text-#6B7280 mt-2">Send payout reports directly to landlord ledgers with one click.</p>
                  </div>
                  <div className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                    <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
                    <h3 className="font-semibold text-[#18452E]">Damage Reporting</h3>
                    <p className="text-[11px] text-#6B7280 mt-2">Log incidents with photos for immediate landlord approval.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Admin' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-display font-semibold text-[#18452E]">Global Admin Ledger</h2>
                  <p className="text-#6B7280 text-sm mt-1">Total platform oversight, zero-trust dispute resolution, and transparency.</p>
                </div>
                
                <div className="bg-[#18452E] text-white p-8 rounded-[var(--radius-large)] relative overflow-hidden">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                     <div>
                       <span className="block text-[10px] font-mono text-[#6FBE45] uppercase tracking-wider mb-2">Global Search</span>
                       <p className="text-sm text-stone-300">Instantly locate any tenant, property, or transaction across the entire unified database.</p>
                     </div>
                     <div>
                       <span className="block text-[10px] font-mono text-[#6FBE45] uppercase tracking-wider mb-2">Dispute Resolution</span>
                       <p className="text-sm text-stone-300">Mediate conflicts between landlords and managers with full immutable ledger history.</p>
                     </div>
                     <div>
                       <span className="block text-[10px] font-mono text-[#6FBE45] uppercase tracking-wider mb-2">Transparency Ledger</span>
                       <p className="text-sm text-stone-300">Audit trail of every login, document upload, and remittance sent across the platform.</p>
                     </div>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
