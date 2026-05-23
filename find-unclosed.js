const fs = require('fs');
const data = fs.readFileSync('./messages/fr.json', 'utf8');
let depth = 0;
let lastOpen = -1;
for (let i = 0; i < data.length; i++) {
  if (data[i] === '{') {
    depth++;
    lastOpen = i;
  } else if (data[i] === '}') {
    depth--;
    if (depth < 0) {
      console.log('Extra closing brace at', i);
      break;
    }
  }
}
console.log('Final depth:', depth);
if (depth > 0) {
  console.log('Last opening brace at position', lastOpen, 'char:', data.charAt(lastOpen));
  // Show context around lastOpen
  console.log('Context:', data.substring(lastOpen-50, lastOpen+50));
}