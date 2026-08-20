const fs = require('fs');

let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf8');

// Inject simple getTenantPhoto
if (!code.includes('const getTenantPhoto =')) {
  code = code.replace(
    /const getLandlordName =[^}]+};/,
    `$&
  const getTenantPhoto = (name: string) => {
    if (name === 'Aisha Bello') return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
    if (name === 'Chidi Okafor') return 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80';
    if (name === 'Ngozi Eze') return 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=80';
    if (name.includes('Emeka')) return 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80';
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
  };`
  );
}

// Replace the image url
code = code.replace(
  /https:\/\/ui-avatars\.com\/api\/\?name=\$\{encodeURIComponent\(u\.tenantName\)\}&background=e2e8f0&color=1B4332&size=100/g,
  `\${getTenantPhoto(u.tenantName)}`
);

fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', code);
