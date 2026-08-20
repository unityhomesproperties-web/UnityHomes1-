const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

code = code.replace(/relationship: randomizedRelation/g, "relationship: 'other'");
code = code.replace(/ChevronDown/g, "ChevronDown");

// Let's also check if ErrorBoundary got imported.
if (!code.includes("import { ErrorBoundary }")) {
  code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { ErrorBoundary } from '../ErrorBoundary';");
}
fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
