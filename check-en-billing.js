const fs = require('fs');
const en = JSON.parse(fs.readFileSync('./messages/en.json', 'utf8'));
console.log('Root billing exists?', !!en.billing);
if (en.billing) {
  console.log('Keys:', Object.keys(en.billing));
  console.log('Has totalOwed?', !!en.billing.totalOwed);
  console.log('Has totalReceivables?', !!en.billing.totalReceivables);
} else {
  console.log('No root billing. Top-level keys:', Object.keys(en));
}