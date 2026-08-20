const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

code = code.replace(
  `              {pmcManagedUnits.map((u) => (
                <div 
                  key={u.id}`,
  `              {pmcManagedUnits.map((u) => {
                  let tenantDetails;
                  try {
                    tenantDetails = getTenantDetails(u.tenantName, u.tenantCode, u.rentAmount, u.propertyName);
                  } catch (e) {
                    tenantDetails = { passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', fullName: 'Tenant details unavailable' };
                  }
                  return (
                <div 
                  key={u.id}`
);

code = code.replace(
  `                  <div className="flex items-center space-x-3">
                    <img 
                      src={getTenantDetails(u.tenantName, u.tenantCode, u.rentAmount, u.propertyName).passportPhoto} 
                      alt={u.tenantName} 
                      className="w-10 h-10 rounded-full object-cover border border-teal-100 shrink-0" 
                    />
                    <div>`,
  `                  <div className="flex items-center space-x-3">
                    <img 
                      src={tenantDetails.passportPhoto} 
                      alt={u.tenantName} 
                      className="w-10 h-10 rounded-full object-cover border border-teal-100 shrink-0" 
                    />
                    <div>`
);

code = code.replace(
  `                  <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl font-bold uppercase">
                    Review File
                  </span>
                </div>
              ))}
            </div>`,
  `                  <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl font-bold uppercase">
                    Review File
                  </span>
                </div>
              );
              })}
            </div>`
);

fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
