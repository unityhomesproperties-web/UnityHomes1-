const fs = require('fs');

let code = fs.readFileSync('src/components/dashboards/TenantDashboard.tsx', 'utf8');

// 1. Loading promises
code = code.replace(
  `    if (match) {
      setCollectionTenant(match);
    }

    // Load promises
    const cachedPromises = localStorage.getItem('uh_promises_to_pay_v1');
    if (cachedPromises) {
      setPromises(JSON.parse(cachedPromises));
    }`,
  `    if (match) {
      setCollectionTenant(match);
      
      // Load promises for this specific tenant only
      const cachedPromises = localStorage.getItem('uh_promises_to_pay_v1');
      if (cachedPromises) {
        const allPromises = JSON.parse(cachedPromises);
        setPromises(allPromises.filter((p) => p.tenantId === match.tenantCode));
      }
    }`
);

// 2. Saving new promise
code = code.replace(
  `    // Save to localStorage
    const updatedPromises = [newPromise, ...promises];
    setPromises(updatedPromises);
    localStorage.setItem('uh_promises_to_pay_v1', JSON.stringify(updatedPromises));`,
  `    // Save to localStorage
    setPromises([newPromise, ...promises]);
    const cachedPromises = localStorage.getItem('uh_promises_to_pay_v1');
    const allPromises = cachedPromises ? JSON.parse(cachedPromises) : [];
    localStorage.setItem('uh_promises_to_pay_v1', JSON.stringify([newPromise, ...allPromises]));`
);

// 3. Fulfilling promise
code = code.replace(
  `      localStorage.setItem('uh_promises_to_pay_v1', JSON.stringify(updatedPromises));
      setPromises(updatedPromises);`,
  `      localStorage.setItem('uh_promises_to_pay_v1', JSON.stringify(updatedPromises));
      setPromises(updatedPromises.filter(p => p.tenantId === collectionTenant.tenantCode));`
);

// 4. Change title
code = code.replace(
  `Active Promises to Pay</h3>`,
  `My Payment Commitments</h3>`
);

fs.writeFileSync('src/components/dashboards/TenantDashboard.tsx', code);
