require('ts-node').register();
const { initialLandlordUnits } = require('./src/data.ts');
const { demoUnits } = require('./src/lib/demoData.ts');

const allUnits = [...initialLandlordUnits, ...demoUnits];
const grouped = {};
allUnits.forEach(u => {
  if (!grouped[u.propertyName]) grouped[u.propertyName] = [];
  grouped[u.propertyName].push(u.rentAmount);
});

for (const prop in grouped) {
  const total = grouped[prop].reduce((a, b) => a + b, 0);
  if (total > 10000000) {
    console.log(prop, 'units:', grouped[prop].length, 'total:', total);
  }
}
