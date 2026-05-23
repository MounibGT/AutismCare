const fs = require('fs');
const data = fs.readFileSync('./messages/ar.json', 'utf8');
// Find billing section manually
const billingMatch = data.match(/"billing"\s*:\s*\{[^}]+\}/);
if (billingMatch) {
  try {
    const billing = JSON.parse(billingMatch[0]);
    console.log('Billing object keys:', Object.keys(billing));
    console.log('Has totalOwed?', !!billing.totalOwed);
    console.log('Has totalPaid?', !!billing.totalPaid);
    console.log('Has paymentsOwed?', !!billing.paymentsOwed);
  } catch(e) {
    console.error('Parse error in billing object');
  }
} else {
  console.log('No billing object found');
}
// Count top-level braces
let depth = 0, inString = false, escape = false;
for (let i = 0; i < data.length; i++) {
  let ch = data[i];
  if (escape) { escape = false; continue; }
  if (ch === '\\' && inString) { escape = true; continue; }
  if (ch === '"' && !inString) inString = true;
  else if (ch === '"' && inString) inString = false;
  if (!inString) {
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
  }
}
console.log('Final brace depth:', depth);
console.log('File length:', data.length);