const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

code = code.replace(/<span className="text-\[10px\] bg-amber-100 text-amber-800 px-2 py-0\.5 rounded font-bold uppercase border border-amber-200">Discrepancy<\/span>[\s\S]*?\}\}*?[\s]*?<\/div>[\s]*?\{[^}]*\/\* PRIVATE REPRESENTED TENANT DOSSIER MATRIX/,
`<span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase border border-amber-200">Discrepancy</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* PRIVATE REPRESENTED TENANT DOSSIER MATRIX`);

fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
