const fs = require('fs');
const data = fs.readFileSync('./messages/ar.json', 'utf8');
const obj = JSON.parse(data);
console.log('Top-level keys:', Object.keys(obj));
console.log('File length:', data.length);
// Show structure depth
function showStructure(o, prefix='', maxDepth=3, depth=0) {
  if (depth >= maxDepth) return;
  if (typeof o === 'object' && o !== null) {
    for (const [k,v] of Object.entries(o)) {
      console.log(prefix + k);
      if (typeof v === 'object' && v !== null) {
        showStructure(v, prefix + '  ', maxDepth, depth+1);
      }
    }
  }
}
console.log('\nStructure (depth 3):');
showStructure(obj, '', 3);