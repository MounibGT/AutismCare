const fs = require('fs');
let data = fs.readFileSync('./messages/ar.json', 'utf8');
// Trim trailing extra whitespace and braces
data = data.trimEnd();
// Remove extra closing braces at end - keep only one
while (data.endsWith('}') && data.slice(0, -1).trimEnd().endsWith('}')) {
  data = data.slice(0, -1).trimEnd();
}
// Ensure file ends with single closing brace for root object
if (!data.endsWith('}')) {
  data = data + '}';
}
// Write and validate
fs.writeFileSync('./messages/ar.json', data);
try {
  JSON.parse(data);
  console.log('Fixed. Valid JSON. Length:', data.length);
} catch(e) {
  console.error('Still invalid:', e.message);
  console.error('Ends with:', data.slice(-20));
}