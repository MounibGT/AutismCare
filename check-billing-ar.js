const fs = require('fs');
const data = fs.readFileSync('./messages/ar.json', 'utf8');
// Find line 143
const lines = data.split('\n');
console.log('Line 142:', JSON.stringify(lines[141]));
console.log('Line 143:', JSON.stringify(lines[142]));
console.log('Line 144:', JSON.stringify(lines[143]));
// Check for non-JSON chars near cancelReason value
const idx = data.indexOf('"cancelReason"');
console.log('\nContext around cancelReason:', data.substring(idx-10, idx+50));
// Try parse just this billing part
const billingStart = data.indexOf('"billing"');
const billingSection = data.substring(billingStart);
console.log('\nBilling section length:', billingSection.length);
// Find matching } for billing
let depth = 0, end = 0;
for (let i = 0; i < billingSection.length; i++) {
  if (billingSection[i] === '"' && (i===0 || billingSection[i-1] !== '\\')) {
    // skip string content
  }
  if (billingSection[i] === '{') depth++;
  else if (billingSection[i] === '}') {
    depth--;
    if (depth === 0) { end = i; break; }
  }
}
console.log('Billing ends at index', end);
console.log('Billing text:', billingSection.substring(0, end+1));
try {
  JSON.parse(billingSection.substring(0, end+1));
  console.log('Billing object valid');
} catch(e) {
  console.error('Billing parse error:', e.message);
}