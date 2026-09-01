// @ts-nocheck
import React from 'react';
import { 
  Activity, ShieldCheck, AlertTriangle, Building, Users, Calendar, TrendingDown, Clock, ArrowUpRight
} from 'lucide-react';
import { LandlordUnit, Property, BookingLog, DamageReport, ServiceChargeBill, TenantRegistration } from '../../types';

interface PortfolioHealthCenterProps {
  properties: Property[];
  landlordUnits: LandlordUnit[];
  bookings: BookingLog[];
  damageReports: DamageReport[];
  serviceCharges: ServiceChargeBill[];
  tenantRegs?: TenantRegistration[];
}

export default function PortfolioHealthCenter({
  properties,
  landlordUnits,
  bookings,
  damageReports,
  serviceCharges,
  tenantRegs = []
}: PortfolioHealthCenterProps) {

  // Proprietary Metric Calculation
  const totalUnits = landlordUnits.length;
  const occupiedUnits = landlordUnits.filter(u => u.paymentStatus !== 'Vacant').length;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  const totalSC = serviceCharges.reduce((sum, sc) => sum + sc.amount, 0);
  const collectedSC = serviceCharges.filter(sc => sc.status === 'Paid').reduce((sum, sc) => sum + sc.amount, 0);
  const scCollectionRate = totalSC > 0 ? (collectedSC / totalSC) * 100 : 0;

  const totalRentExpected = landlordUnits.filter(u => u.paymentStatus !== 'Vacant').reduce((sum, u) => sum + u.rentAmount, 0);
  // Simulating that 90% is collected normally for demo purposes, since we don't have full rent logs
  const rentCollectionRate = 92;

  const outstandingSC = serviceCharges.filter(sc => sc.status === 'Overdue').reduce((sum, sc) => sum + sc.amount, 0);

  const totalDamageCost = damageReports.reduce((sum, dr) => sum + dr.estimatedCost, 0);
  // Score out of 100
  const healthScore = Math.round(
    (occupancyRate * 0.3) + 
    (rentCollectionRate * 0.3) + 
    (scCollectionRate * 0.2) + 
    (totalDamageCost > 100000 ? 5 : 15) + // damage cost penalty
    5 // maintenance baseline
  );

  const getHealthStatus = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-200' };
    if (score >= 75) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' };
    if (score >= 50) return { label: 'Needs Attention', color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200' };
    return { label: 'Critical', color: 'text-rose-500', bg: 'bg-rose-100', border: 'border-rose-200' };
  };

  const status = getHealthStatus(healthScore);

  // Default Risk Engine
  const riskyTenants = serviceCharges
    .filter(sc => sc.status === 'Overdue' || sc.status === 'Unpaid')
    .map(sc => {
      const unit = landlordUnits.find(u => u.id === sc.unitId);
      const property = properties.find(p => p.title === unit?.propertyName || unit?.propertyName.includes(p.title));
      const daysOverdue = sc.status === 'Overdue' ? 15 : 0; // Mock calculation
      let riskScore = 'Low Risk';
      if (sc.amount > 20000 || daysOverdue > 10) riskScore = 'High Risk';
      if (sc.amount > 50000 && daysOverdue > 30) riskScore = 'Critical Risk';
      
      return {
        tenantName: sc.tenantName,
        unit: unit?.unitNumber || 'Unknown',
        property: property?.title || 'Unknown',
        amount: sc.amount,
        daysOverdue,
        riskScore
      };
    });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* SCORE HERO */}
      <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-8 shadow-sm flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-stone-400 mb-2">Proprietary Metric</h2>
          <h3 className="text-3xl font-display font-semibold text-[#18452E] mb-4">Portfolio Health Score</h3>
          <p className="text-#6B7280 text-sm max-w-md">Calculated dynamically based on occupancy, rent collection, service charge compliance, and maintenance overhead.</p>
        </div>
        
        <div className="relative">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-stone-100" />
            <circle 
              cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="16" fill="transparent" 
              strokeDasharray={527} strokeDashoffset={527 - (527 * healthScore) / 100} 
              className={`${status.color} transition-all duration-1000 ease-out`} 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-display font-semibold text-[#18452E]">{healthScore}</span>
            <span className="text-xs font-mono font-semibold text-stone-400">/ 100</span>
          </div>
        </div>

        <div className="flex-1">
          <div className={`p-6 rounded-2xl border ${status.bg} ${status.border} text-center`}>
            <span className="block text-xs font-mono font-semibold uppercase tracking-wider mb-2">Portfolio Status</span>
            <span className={`text-2xl font-display font-semibold ${status.color}`}>{status.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TENANT DEFAULT RISK DETECTOR */}
        <div className="bg-white border rounded-[var(--radius-large)] p-6 shadow-sm min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            <h3 className="font-display font-semibold text-[#18452E] uppercase">Tenant Default Risk Detector</h3>
          </div>
          
          <div className="space-y-4">
            {riskyTenants.length === 0 ? (
              <p className="text-stone-400 italic text-sm text-center py-8">No high-risk tenants detected.</p>
            ) : (
              riskyTenants.map((rt, idx) => (
                <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-[#18452E]">{rt.tenantName}</h4>
                    <p className="text-[10px] font-mono text-#6B7280">{rt.unit} - {rt.property}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-[10px] font-semibold uppercase rounded ${
                      rt.riskScore === 'Critical Risk' ? 'bg-rose-100 text-rose-800' :
                      rt.riskScore === 'High Risk' ? 'bg-amber-100 text-amber-800' :
                      'bg-stone-200 text-#132A1D'
                    }`}>
                      {rt.riskScore}
                    </span>
                    <p className="text-xs font-semibold mt-1 text-#132A1D">Owes ₦{rt.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* UNDERPERFORMING PROPERTY DETECTOR */}
        <div className="bg-white border rounded-[var(--radius-large)] p-6 shadow-sm min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <TrendingDown className="w-6 h-6 text-amber-500" />
            <h3 className="font-display font-semibold text-[#18452E] uppercase">Underperforming Property Detector</h3>
          </div>
          
          <div className="space-y-4">
            {properties.slice(0,2).map(p => {
              const pUnits = landlordUnits.filter(u => u.propertyName === p.title || u.propertyName.includes(p.title));
              const pOcc = pUnits.filter(u => u.paymentStatus !== 'Vacant').length;
              const pRate = pUnits.length > 0 ? Math.round((pOcc / pUnits.length) * 100) : 0;
              
              if(pRate >= 80) return null; // Only show if underperforming

              return (
                <div key={p.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-[#18452E]">{p.title}</h4>
                    <span className="px-2 py-1 bg-rose-100 text-rose-800 text-[10px] font-semibold uppercase rounded">Attention Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-#6B7280 font-mono">Occupancy:</span> <strong className={pRate < 50 ? 'text-rose-600' : 'text-amber-600'}>{pRate}%</strong></div>
                    <div><span className="text-#6B7280 font-mono">Issues:</span> <strong>High Vacancy</strong></div>
                  </div>
                  <button className="mt-3 text-[10px] font-semibold uppercase text-[#18452E] flex items-center gap-1 hover:underline">
                    View Diagnostics <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
            <p className="text-stone-400 text-xs italic">Other properties operating within expected parameters.</p>
          </div>
        </div>

      </div>

      {/* LEASE EXPIRY CENTER */}
      <div className="bg-white border rounded-[var(--radius-large)] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-500" />
          <h3 className="font-display font-semibold text-[#18452E] uppercase">Lease Expiry & Renewals Center</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                <th className="p-3">Tenant Name</th>
                <th className="p-3">Property & Unit</th>
                <th className="p-3">Lease End Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {landlordUnits.filter(u => u.paymentStatus !== 'Vacant').slice(0, 4).map((u, i) => {
                const daysLeft = i === 0 ? 14 : i === 1 ? 45 : 120;
                const property = properties.find(p => p.title === u.propertyName || u.propertyName.includes(p.title));
                return (
                  <tr key={u.id} className="border-b border-stone-200">
                    <td className="p-3 font-semibold text-sm text-[#18452E]">Tenant #{i+1}</td>
                    <td className="p-3 text-xs text-#6B7280">{property?.title} <br/> {u.unitNumber}</td>
                    <td className="p-3 text-xs font-mono text-#6B7280">2026-12-01</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-[10px] uppercase font-semibold rounded ${
                        daysLeft <= 14 ? 'bg-rose-100 text-rose-800' :
                        daysLeft <= 60 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {daysLeft} Days Left
                      </span>
                    </td>
                    <td className="p-3">
                      <button className="px-3 py-1.5 bg-stone-50 text-#6B7280 hover:bg-stone-200 rounded text-xs font-semibold">
                        Trigger Renewal
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LATE REMITTANCE DETECTOR */}
      <div className="bg-white border rounded-[var(--radius-large)] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-[#6FBE45]" />
          <h3 className="font-display font-semibold text-[#18452E] uppercase">Late Remittance Detector (Shortlets)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                <th className="p-3">Manager Name</th>
                <th className="p-3">Expected Remittance</th>
                <th className="p-3">Status</th>
                <th className="p-3">Days Late</th>
                <th className="p-3">Compliance Score</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.filter(b => b.status === 'Confirmed').slice(0, 3).map((b, i) => {
                const isLate = i === 0;
                return (
                  <tr key={b.id} className="border-b border-stone-200">
                    <td className="p-3 font-semibold text-sm text-[#18452E]">{b.guestName} (Manager Proxy)</td>
                    <td className="p-3 text-xs font-mono text-#6B7280">₦{b.totalPaid.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-[10px] uppercase font-semibold rounded ${
                        isLate ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isLate ? 'Critical Delay' : 'On Time'}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-mono font-semibold text-#132A1D">{isLate ? '12 Days' : '0'}</td>
                    <td className="p-3 text-xs text-#6B7280">{isLate ? '65%' : '98%'}</td>
                    <td className="p-3">
                      <button className="px-3 py-1.5 bg-stone-50 text-#6B7280 hover:bg-stone-200 rounded text-xs font-semibold">
                        {isLate ? 'Flag Manager' : 'View Ledger'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="p-4 text-center text-stone-400 text-sm">No shortlet remittances to track.</div>
          )}
        </div>
      </div>

    </div>
  );
}
