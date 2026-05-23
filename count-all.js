const fs = require('fs');
const content = fs.readFileSync('src/app/(privilaged)/client/dashboard/billing/page.tsx', 'utf8');

// Count total parentheses in entire file
let opens = 0, closes = 0;
for (let ch of content) {
  if (ch === '(') opens++;
  if (ch === ')') closes++;
}
console.log(`Total '(' : ${opens}`);
console.log(`Total ')' : ${closes}`);
console.log(`Net balance: ${opens - closes}`);

// Also count braces
let opensB = 0, closesB = 0;
for (let ch of content) {
  if (ch === '{') opensB++;
  if (ch === '}') closesB++;
}
console.log(`Total '{' : ${opensB}`);
console.log(`Total '}' : ${closesB}`);
console.log(`Net braces: ${opensB - closesB}`);
