const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf8');

code = code.replace(/    <\/div>\n      \{showNotifications && \(/, 
`      {showNotifications && (`);

code = code.replace(/        setShowNotifications=\{setShowNotifications\}\n      \/>\n    <\/div>\n  \);\n\}/, 
`        setShowNotifications={setShowNotifications}
      />
    </div>
  );
}`);

fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', code);
