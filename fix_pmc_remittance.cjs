const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

const regex = /\/\/ Simulated remittance values[\s\S]*?const awaitingRemittance = collectedRent - actualRemitted;/;

const replacement = `// NEW LIVE CALCULATION FOR REMITTANCE AND FULLY ACCOUNTED STATUS
              const propertyRemittances = bookings.filter(b => b.propertyName === propName);
              const actualRemitted = propertyRemittances
                .filter(b => b.status === 'Acknowledged' || b.status === 'Pending Acknowledgement')
                .reduce((sum, b) => sum + b.remittanceAmount, 0);

              const hasOutstandingRemittances = propertyRemittances.some(b => !b.remittanceFormSent || b.status === 'Pending');

              const isFullyAccounted = 
                collectedRent > 0 && 
                (actualRemitted + managementFee) === collectedRent && 
                !hasOutstandingRemittances;
              
              const awaitingRemittance = collectedRent > 0 ? (collectedRent - actualRemitted - managementFee) : 0;`;

code = code.replace(regex, replacement);

const statusRegex = /\{isFullyAccounted \? \([\s\S]*?\}\)/;
const statusReplacement = `{collectedRent === 0 ? (
                        <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded font-bold uppercase border border-stone-200">No Payments Recorded</span>
                      ) : isFullyAccounted ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase border border-emerald-200">{'Fully Accounted'}</span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase border border-amber-200">Discrepancy</span>
                      )}`;

code = code.replace(statusRegex, statusReplacement);

fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
