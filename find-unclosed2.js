const fs = require('fs');
const data = fs.readFileSync('./messages/fr.json', 'utf8');
let stack = [];
for (let i = 0; i < data.length; i++) {
  if (data[i] === '{') {
    stack.push(i);
  } else if (data[i] === '}') {
    if (stack.length === 0) {
      console.log('Extra } at position', i);
      break;
    }
    stack.pop();
  }
}
if (stack.length) {
  console.log('Unclosed { at positions:', stack);
  console.log('Last unclosed at:', stack[stack.length-1]);
  console.log('Context:', data.substring(stack[stack.length-1]-100, stack[stack.length-1]+100));
} else {
  console.log('All braces matched');
}