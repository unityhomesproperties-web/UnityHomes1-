const fs = require('fs');

let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /<div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500 border border-stone-100">[^<]+<\/div>/g,
  `<img 
    src={\`https://ui-avatars.com/api/?name=\${encodeURIComponent(u.tenantName)}&background=e2e8f0&color=1B4332&size=100\`} 
    alt={u.tenantName} 
    className="w-10 h-10 rounded-full object-cover border border-stone-100"
  />`
);

fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', code);
