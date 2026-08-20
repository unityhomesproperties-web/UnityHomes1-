const fs = require('fs');

function processFile(filename) {
  if (!fs.existsSync(filename)) return;
  let code = fs.readFileSync(filename, 'utf8');
  
  // Scale down specific keys:
  // assetValue, portfolioValue, outstanding, amount, expected, revenue, totalPaid, remittanceAmount, managementFeeAmount, rentPaid
  
  const keys = ['assetValue', 'portfolioValue', 'outstanding', 'outstandingAmount', 'promisedAmount', 'amount', 'expected', 'revenue', 'totalPaid', 'remittanceAmount', 'managementFeeAmount', 'rentPaid'];
  
  keys.forEach(key => {
    const regex = new RegExp(`(${key}:\\s*)(\\d+)`, 'g');
    code = code.replace(regex, (match, prefix, numStr) => {
      let num = parseInt(numStr, 10);
      if (num > 100000) {
        return prefix + Math.floor(num / 5);
      }
      return match;
    });
  });
  
  // Replace millions in formatting e.g. / 1000000
  // Actually, wait, if we divide by 5, the millions formatting might show 0.M. Let's just leave the formatting alone, it will just show smaller numbers.
  
  fs.writeFileSync(filename, code);
}

['src/data.ts', 'src/lib/demoData.ts', 'src/components/dashboards/AdminDashboard.tsx', 'src/components/DemoPerformanceCenter.tsx'].forEach(processFile);
