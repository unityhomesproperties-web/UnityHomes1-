const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

const effectCode = `
  useEffect(() => {
    if (selectedUnit) {
      const isManaged = pmcManagedUnits.some(u => u.tenantCode === selectedUnit.tenantCode);
      if (!isManaged) {
        alert("This tenant is not under your managed portfolio.");
        setSelectedUnit(null);
        setActiveTab('Landlords');
      }
    }
  }, [selectedUnit, pmcManagedUnits]);
`;

code = code.replace(
  `  const [activeTab, setActiveTab] = useState<'Overview' | 'Landlords' | 'Payments' | 'PortfolioHealth' | 'ServiceCharges' | 'TenantIntelligence' | 'Complaints'>('Overview');`,
  `  const [activeTab, setActiveTab] = useState<'Overview' | 'Landlords' | 'Payments' | 'PortfolioHealth' | 'ServiceCharges' | 'TenantIntelligence' | 'Complaints'>('Overview');\n${effectCode}`
);

fs.writeFileSync('src/components/dashboards/PmcDashboard.tsx', code);
