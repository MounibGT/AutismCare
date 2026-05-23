const fs = require('fs');
// Read current Arabic
let ar = require('./messages/ar.json');
// Ensure billing has all needed client keys
const neededClientKeys = ['totalOwed', 'totalPaid', 'paymentsOwed', 'noPaymentsOwed'];
const billing = ar.billing || {};
neededClientKeys.forEach(k => {
  if (!billing[k]) {
    // Add with placeholder translation (we'll fill later)
    billing[k] = `[${k}]`;
  }
});
ar.billing = billing;
// Write back with nice formatting
fs.writeFileSync('./messages/ar.json', JSON.stringify(ar, null, 2));
console.log('Added missing client keys to Arabic billing');
// Validate
try {
  JSON.parse(JSON.stringify(ar));
  console.log('Valid JSON structure');
} catch(e) {
  console.error('Invalid:', e.message);
}