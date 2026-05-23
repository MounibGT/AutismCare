const fs = require('fs');
const data = fs.readFileSync('./messages/fr.json', 'utf8');
// Find the second billing object start from "billing": { after line 2503
const startIdx = data.indexOf('"billing": {', 125000); // approximate
console.log('Second billing start index:', startIdx);
if (startIdx !== -1) {
  // Find matching closing brace for this billing object
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = startIdx; i < data.length; i++) {
    let ch = data[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"' && !inString) inString = true;
    else if (ch === '"' && inString) inString = false;
    if (!inString) {
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          console.log('Billing object ends at', i);
          console.log('Billing object text:', data.substring(startIdx, i+1));
          break;
        }
      }
    }
  }
}