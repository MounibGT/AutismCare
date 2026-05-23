const fs = require('fs');
const data = fs.readFileSync('./messages/fr.json', 'utf8');
console.log('File length:', data.length);
console.log('Last 100 chars:', JSON.stringify(data.slice(-100)));