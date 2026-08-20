const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

code = code.replace("RefreshCw\n} from 'lucide-react';", "RefreshCw, ChevronDown\n} from 'lucide-react';");

fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
