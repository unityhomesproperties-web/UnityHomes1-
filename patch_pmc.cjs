const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

// 1. Add ErrorBoundary import
code = code.replace(
  "import { ShieldCheck, Calendar, Activity, ChevronRight, X, User, MessageCircle, AlertCircle, Wrench, Search, Building2, MapPin, Phone, Home, DollarSign, Wallet, FileText, Upload, ChevronDown } from 'lucide-react';",
  "import { ShieldCheck, Calendar, Activity, ChevronRight, X, User, MessageCircle, AlertCircle, Wrench, Search, Building2, MapPin, Phone, Home, DollarSign, Wallet, FileText, Upload, ChevronDown } from 'lucide-react';\nimport { ErrorBoundary } from '../ErrorBoundary';"
);

// 2. Wrap return of PmcDashboard in ErrorBoundary
code = code.replace(
  `  return (
    <div className="space-y-8 pb-16 text-xs sm:text-sm font-sans theme-teal tracking-wide">
      
      {/* HIGH VISIBILITY SUBSCRIPTION LIMIT BANNER */}`,
  `  return (
    <ErrorBoundary>
    <div className="space-y-8 pb-16 text-xs sm:text-sm font-sans theme-teal tracking-wide">
      
      {/* HIGH VISIBILITY SUBSCRIPTION LIMIT BANNER */}`
);

code = code.replace(
  `      )}
    </div>
  );
};`,
  `      )}
    </div>
    </ErrorBoundary>
  );
};`
);

// 3. Update getTenantDetails to use try/catch and fallback
code = code.replace(
  `  const getTenantDetails = (tenantName: string, tenantCode: string, rentAmount: number, propertyName: string) => {
    const registrations = loadTenantRegistrations();
    const matched = registrations.find(r => r.fullName.toLowerCase() === tenantName.toLowerCase());
    
    // Choose relationship to display
    const relations = ['parent', 'sibling', 'employer', 'spouse', 'other'];
    const index = Math.abs(tenantName.charCodeAt(0) + tenantName.charCodeAt(tenantName.length - 1 || 0)) % relations.length;
    const randomizedRelation = relations[index];

    if (matched) {
      return {
        fullName: matched.fullName,
        phone: matched.phone || '+234 812 345 6789',
        occupation: matched.occupation || 'Consultant',
        passportPhoto: matched.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        guarantorName: matched.guarantorName || 'Dr. Arthur Mokeme',
        guarantorPhone: matched.guarantorPhone || '+234 805 111 2222',
        relationship: randomizedRelation
      };
    }

    // Default seeded details`,
  `  const getTenantDetails = (tenantName: string, tenantCode: string, rentAmount: number, propertyName: string) => {
    try {
      const registrations = loadTenantRegistrations();
      const matched = registrations.find(r => r.fullName.toLowerCase() === tenantName.toLowerCase());
      
      // Choose relationship to display
      const relations = ['parent', 'sibling', 'employer', 'spouse', 'other'];
      const index = Math.abs(tenantName.charCodeAt(0) + tenantName.charCodeAt(tenantName.length - 1 || 0)) % relations.length;
      const randomizedRelation = relations[index];

      if (matched) {
        return {
          fullName: matched.fullName,
          phone: matched.phone || '+234 812 345 6789',
          occupation: matched.occupation || 'Consultant',
          passportPhoto: matched.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          guarantorName: matched.guarantorName || 'Dr. Arthur Mokeme',
          guarantorPhone: matched.guarantorPhone || '+234 805 111 2222',
          relationship: randomizedRelation
        };
      }
    } catch (error) {
      console.error("Error fetching tenant details:", error);
      return {
        fullName: 'Tenant details unavailable',
        phone: 'N/A',
        occupation: 'N/A',
        passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        guarantorName: 'N/A',
        guarantorPhone: 'N/A',
        relationship: 'other'
      };
    }

    // Default seeded details`
);

// 4. Wrap expanded roster map in try/catch mapping safely:
code = code.replace(
  `                          {unitsInLandlord.filter(u => u.paymentStatus !== 'Vacant').map(u => (
                            <div 
                              key={u.id}`,
  `                          {unitsInLandlord.filter(u => u.paymentStatus !== 'Vacant').map(u => {
                              let tenantDetails;
                              try {
                                tenantDetails = getTenantDetails(u.tenantName, u.tenantCode, u.rentAmount, u.propertyName);
                              } catch (e) {
                                console.error(e);
                                tenantDetails = { passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', fullName: 'Tenant details unavailable' };
                              }
                              return (
                            <div 
                              key={u.id}`
);

code = code.replace(
  `                                  <img 
                                    src={getTenantDetails(u.tenantName, u.tenantCode, u.rentAmount, u.propertyName).passportPhoto} 
                                    alt={u.tenantName} 
                                    className="w-10 h-10 rounded-full object-cover border border-stone-100"
                                  />`,
  `                                  <img 
                                    src={tenantDetails.passportPhoto} 
                                    alt={u.tenantName} 
                                    className="w-10 h-10 rounded-full object-cover border border-stone-100"
                                  />`
);

code = code.replace(
  `                                )}
                              </div>
                            </div>
                          ))}
                        </div>`,
  `                                )}
                              </div>
                            </div>
                          );
                          })}
                        </div>`
);

fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
