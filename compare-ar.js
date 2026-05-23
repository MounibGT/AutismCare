const fs = require('fs');
let data = fs.readFileSync('./messages/ar.json', 'utf8');
// The file is truncated after billing. Need to find where it should end.
// Let's get proper ending from English file structure
const en = require('./messages/en.json');
// Get all top-level keys from English
const enKeys = Object.keys(en);
console.log('English top keys:', enKeys);
// Check Arabic current keys
let ar;
try {
  ar = JSON.parse(data);
} catch(e) {
  console.error('Parse error at position', e.position);
  // Trim to just before error
  data = data.substring(0, e.position);
  ar = JSON.parse(data);
}
console.log('Arabic current keys:', Object.keys(ar));
console.log('Missing from Arabic:', enKeys.filter(k => !ar[k]));