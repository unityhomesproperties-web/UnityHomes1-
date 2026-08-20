const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

code = code.replace(
  `      <MobileBottomNav 
        role="PMC"
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        setShowNotifications={setShowNotifications}
      />
    </div>
  );
}`,
  `      <MobileBottomNav 
        role="PMC"
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        setShowNotifications={setShowNotifications}
      />
    </div>
    </ErrorBoundary>
  );
}`
);

fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
