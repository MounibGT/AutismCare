const fs = require('fs');
const data = fs.readFileSync('./messages/ar.json', 'utf8');
console.log('File length:', data.length);
console.log('Last 20 chars:', JSON.stringify(data.slice(-20)));
console.log('Last non-whitespace char at end:', data.trimEnd().slice(-1));
console.log('Trimmed length:', data.trimEnd().length);