const fs = require('fs');
const data = fs.readFileSync('./messages/fr.json', 'utf8');
const pos = 126800;
console.log('Context around position', pos);
console.log(data.substring(pos-50, pos+50));
