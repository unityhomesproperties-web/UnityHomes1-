const fs = require('fs');

let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

// The replacement was already done. Let's make sure the badge colors are correct.
code = code.replace(
  /\{u.paymentStatus === 'Paid' \? \([\s\S]*?\}\)/,
  `{u.paymentStatus === 'Paid' ? (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold uppercase">Paid</span>
                                ) : u.paymentStatus === 'Due Soon' ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold uppercase">Due Soon</span>
                                ) : u.paymentStatus === 'Overdue' ? (
                                  <div className="text-right">
                                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-1 rounded font-bold uppercase block mb-1">Overdue</span>
                                    <span className="text-xs font-mono font-black text-red-700 block">₦{u.rentAmount.toLocaleString()}</span>
                                  </div>
                                ) : u.paymentStatus === 'Lease Expiring Soon' ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold uppercase">Expiring</span>
                                ) : (
                                  <span className="text-[10px] bg-stone-100 text-stone-800 px-2 py-1 rounded font-bold uppercase">{u.paymentStatus}</span>
                                )}`
);

fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
