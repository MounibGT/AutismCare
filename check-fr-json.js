const fs = require('fs');
try {
  const data = fs.readFileSync('./messages/fr.json', 'utf8');
  const obj = JSON.parse(data);
  console.log('Valid JSON, root keys:', Object.keys(obj));
  console.log('Billing keys count:', Object.keys(obj.billing).length);
} catch (e) {
  console.error('JSON parse error:', e.message);
  console.error('Position:', e.position);
}