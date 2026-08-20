const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

// 1. Fix missing ChevronDown in lucide-react imports
code = code.replace(
  "Trash2, X, ArrowLeft, Award, AlertCircle,  ArrowUpRight, Clock, MessageSquare, Bell, CheckCircle2, DollarSign, Filter, RefreshCw\n} from 'lucide-react';",
  "Trash2, X, ArrowLeft, Award, AlertCircle,  ArrowUpRight, Clock, MessageSquare, Bell, CheckCircle2, DollarSign, Filter, RefreshCw, ChevronDown\n} from 'lucide-react';"
);

// 2. Add ErrorBoundary import if not present
if (!code.includes("import { ErrorBoundary }")) {
  code = code.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { ErrorBoundary } from '../ErrorBoundary';"
  );
}

// 3. Fix randomizedRelation error
code = code.replace(
  `      relationship: randomizedRelation`,
  `      relationship: 'other'`
);

fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
