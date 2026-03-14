const fs = require('fs');
let c = fs.readFileSync('app/components/dashboard/ChatWidget.tsx', 'utf8');
const nl = c.includes('\r\n') ? '\r\n' : '\n';
const importLine = 'import AnimatedPlaceholder from "../ui/AnimatedPlaceholder";';
// Remove one occurrence of the duplicate line
const dup = importLine + nl + importLine;
const single = importLine;
if (c.includes(dup)) {
  c = c.replace(dup, single);
  fs.writeFileSync('app/components/dashboard/ChatWidget.tsx', c, 'utf8');
  console.log('Duplicate import removed OK');
} else {
  console.log('Pattern not found, checking file:');
  const idx = c.indexOf('AnimatedPlaceholder');
  console.log('Context:', JSON.stringify(c.slice(Math.max(0,idx-10), idx+180)));
}
