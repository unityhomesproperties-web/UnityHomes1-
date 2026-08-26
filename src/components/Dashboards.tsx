import React, { useState, useEffect } from 'react';
import { UserSession, LandlordUnit, BookingLog, DamageReport, ServiceChargeBill, PMCApplication, TenantRegistration, VerificationInquiry, Building, Property } from '../types';
import { useLiveCollection } from '../lib/database';
import { 
  initialLandlordUnits, 
  initialBookingLogs, 
  initialServiceCharges, 
  initialProperties, 
  initialProfessionals, 
  initialDamageReports,
  loadPMCApplications,
  loadTenantRegistrations,
  loadInquiries,
  initialBuildings
} from '../data';

import AdminDashboard from './dashboards/AdminDashboard';
import LandlordDashboard from './dashboards/LandlordDashboard';
import PmcDashboard from './dashboards/PmcDashboard';
import ShortletDashboard from './dashboards/ShortletDashboard';
import TenantDashboard from './dashboards/TenantDashboard';
import GlobalSearch from './GlobalSearch';

interface DashboardsProps {
  session: UserSession;
  navigate: (path: string, params?: any) => void;
  onLogout: () => void;
}

export default function Dashboards({ session, navigate, onLogout }: DashboardsProps) {
  const [landlordUnits, setLandlordUnits] = useState<LandlordUnit[]>(() => {
    try {
      const stored = localStorage.getItem('uh_collection_tenants_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialLandlordUnits;
  });

  const [bookings, setBookings] = useState<BookingLog[]>(() => {
    try {
      const stored = localStorage.getItem('uh_shortlet_bookings_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialBookingLogs;
  });
  
  // Note: Local states for those not fully managed via useLiveCollection or requiring set functions in props
  const [damageReports, setDamageReports] = useState<DamageReport[]>(initialDamageReports);
  
  const [serviceCharges, setServiceCharges] = useState<ServiceChargeBill[]>(() => {
    try {
      const stored = localStorage.getItem('uh_service_charges_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialServiceCharges;
  });

  const [successMsg, setSuccessMsg] = useState<string>('');

  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const stored = localStorage.getItem('uh_properties_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialProperties;
  });

  const [buildings, setBuildings] = useState<Building[]>(() => {
    try {
      const stored = localStorage.getItem('uh_buildings_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialBuildings;
  });

  const [subscriptions, setSubscriptions] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_subscriptions_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'sub-funmi', entityId: 'UH-LANDLORD-FUNMI', name: 'Mrs Funmi Adebayo', type: 'Landlord', subscription: 'Landlord Growth Profile Pack', property_limit: 30 },
      { id: 'sub-osei', entityId: 'UH-LANDLORD-OSEI', name: 'Mr Babatunde Osei', type: 'Landlord', subscription: 'Landlord Growth Profile Pack', property_limit: 30 },
      { id: 'sub-prime', entityId: 'Prime Property Solutions', name: 'Prime Property Solutions', type: 'PMC', subscription: 'PMC Professional Suite', property_limit: 100 },
      { id: 'sub-lrp', entityId: 'Lagos Realty Partners', name: 'Lagos Realty Partners', type: 'PMC', subscription: 'Starter Suite', property_limit: 10, original_limit: 10 }
    ];
  });

  const [managementCompanyProperties, setManagementCompanyProperties] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_management_company_properties_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    
    const initialMcp: any[] = [];
    initialBuildings.forEach(b => {
      let company_id = '';
      if (b.landlordCode === 'UH-LANDLORD-OSEI') {
        company_id = 'Prime Property Solutions';
      } else if (b.landlordCode === 'UH-LANDLORD-MUSA') {
        company_id = 'Lagos Realty Partners';
      }
      if (company_id) {
        initialMcp.push({
          id: `mcp-${b.id}`,
          buildingId: b.id,
          propertyName: b.name,
          company_id: company_id,
          is_active: true
        });
      }
    });

    const lrpCount = initialMcp.filter(m => m.company_id === 'Lagos Realty Partners').length;
    if (lrpCount < 11) {
      for (let i = lrpCount + 1; i <= 11; i++) {
        initialMcp.push({
          id: `mcp-lrp-dummy-${i}`,
          buildingId: `bld-lrp-dummy-${i}`,
          propertyName: `Lagos Realty Plaza Block ${i}`,
          company_id: 'Lagos Realty Partners',
          is_active: true
        });
      }
    }
    return initialMcp;
  });

  const [pmcApps, setPmcApps] = useState<PMCApplication[]>(loadPMCApplications());
  const [tenantApps, setTenantApps] = useState<TenantRegistration[]>(loadTenantRegistrations());
  const [inquiries, setInquiries] = useState<VerificationInquiry[]>(loadInquiries());

  // Local storage state synchronization
  useEffect(() => {
    localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(landlordUnits));
  }, [landlordUnits]);

  useEffect(() => {
    localStorage.setItem('uh_shortlet_bookings_v1', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('uh_service_charges_v1', JSON.stringify(serviceCharges));
  }, [serviceCharges]);

  useEffect(() => {
    localStorage.setItem('uh_properties_v1', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('uh_buildings_v1', JSON.stringify(buildings));
  }, [buildings]);

  useEffect(() => {
    localStorage.setItem('uh_subscriptions_v1', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('uh_management_company_properties_v1', JSON.stringify(managementCompanyProperties));
  }, [managementCompanyProperties]);

  // Real-time listener for multi-tab updates
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      try {
        if (e.key === 'uh_collection_tenants_v1' && e.newValue) {
          setLandlordUnits(JSON.parse(e.newValue));
        }
        if (e.key === 'uh_shortlet_bookings_v1' && e.newValue) {
          setBookings(JSON.parse(e.newValue));
        }
        if (e.key === 'uh_service_charges_v1' && e.newValue) {
          setServiceCharges(JSON.parse(e.newValue));
        }
        if (e.key === 'uh_properties_v1' && e.newValue) {
          setProperties(JSON.parse(e.newValue));
        }
        if (e.key === 'uh_buildings_v1' && e.newValue) {
          setBuildings(JSON.parse(e.newValue));
        }
        if (e.key === 'uh_subscriptions_v1' && e.newValue) {
          setSubscriptions(JSON.parse(e.newValue));
        }
        if (e.key === 'uh_management_company_properties_v1' && e.newValue) {
          setManagementCompanyProperties(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Error syncing StorageEvent', err);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);


  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const renderDashboard = () => {
    switch (session.role) {
      case 'Admin':
        return (
          <AdminDashboard 
            pmcApps={pmcApps}
            setPmcApps={setPmcApps}
            tenantApps={tenantApps}
            setTenantApps={setTenantApps}
            inquiries={inquiries}
            setInquiries={setInquiries}
            landlordUnits={landlordUnits}
            setLandlordUnits={setLandlordUnits}
            bookings={bookings}
            setBookings={setBookings}
            properties={properties}
            setProperties={setProperties}
            buildings={buildings}
            setBuildings={setBuildings}
            subscriptions={subscriptions}
            setSubscriptions={setSubscriptions}
            managementCompanyProperties={managementCompanyProperties}
            setManagementCompanyProperties={setManagementCompanyProperties}
            professionals={initialProfessionals}
            damageReports={damageReports}
            serviceCharges={serviceCharges}
            setServiceCharges={setServiceCharges}
            navigate={navigate}
          />
        );
      case 'Landlord':
        return (
          <LandlordDashboard 
            session={session}
            properties={properties}
            setProperties={setProperties}
            buildings={buildings}
            setBuildings={setBuildings}
            subscriptions={subscriptions}
            setSubscriptions={setSubscriptions}
            landlordUnits={landlordUnits}
            setLandlordUnits={setLandlordUnits}
            bookings={bookings}
            setBookings={setBookings}
            damageReports={damageReports}
            setDamageReports={setDamageReports}
            serviceCharges={serviceCharges}
            setServiceCharges={setServiceCharges}
            navigate={navigate}
          />
        );
      case 'PMC':
        return (
          <PmcDashboard 
            session={session}
            properties={properties}
            setProperties={setProperties}
            buildings={buildings}
            setBuildings={setBuildings}
            subscriptions={subscriptions}
            setSubscriptions={setSubscriptions}
            managementCompanyProperties={managementCompanyProperties}
            setManagementCompanyProperties={setManagementCompanyProperties}
            landlordUnits={landlordUnits}
            setLandlordUnits={setLandlordUnits}
            bookings={bookings}
            damageReports={damageReports}
            serviceCharges={serviceCharges}
            setServiceCharges={setServiceCharges}
            navigate={navigate}
          />
        );
      case 'Shortlet Manager':
        return (
          <ShortletDashboard 
            session={session}
            bookings={bookings}
            setBookings={setBookings}
            damageReports={damageReports}
            setDamageReports={setDamageReports}
          />
        );
      case 'Tenant':
        return (
          <TenantDashboard 
            session={session}
            landlordUnits={landlordUnits}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-red-500 font-semibold">
            Unknown user role: {session.role}
            <div className="mt-4">
              <button onClick={onLogout} className="px-4 py-2 bg-stone-200 text-#132A1D rounded">Logout</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col relative">
      {successMsg && (
        <div className="fixed top-4 right-4 z-[100] p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center shadow-sm">
          <span className="text-sm font-semibold text-emerald-800">{successMsg}</span>
        </div>
      )}
      <GlobalSearch 
        session={session}
        landlordUnits={landlordUnits}
        bookings={bookings}
        damageReports={damageReports}
        serviceCharges={serviceCharges}
        pmcApps={pmcApps}
        tenantApps={tenantApps}
        inquiries={inquiries}
        properties={initialProperties}
        professionals={initialProfessionals}
        onNavigate={(type, id) => triggerSuccess(`Navigating to ${type} record: ${id}`)}
      />
      {renderDashboard()}
    </div>
  );
}
