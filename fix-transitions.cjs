const fs = require('fs');

function patch(filePath, pairs) {
  let c = fs.readFileSync(filePath, 'utf8');
  const nl = c.includes('\r\n') ? '\r\n' : '\n';
  let ok = 0;
  for (const [from, to] of pairs) {
    const f = from.replace(/\n/g, nl);
    const t = to.replace(/\n/g, nl);
    if (!c.includes(f)) { console.log('  MISS:', JSON.stringify(from.slice(0, 80))); continue; }
    c = c.replace(f, t);
    ok++;
  }
  fs.writeFileSync(filePath, c, 'utf8');
  console.log(filePath, '->', ok + '/' + pairs.length);
}

// 1. Bookmark button in ticker page — direct click, must feel instant
patch('app/ticker/[symbol]/page.tsx', [
  [
    'transition-all duration-300 flex-shrink-0 border flex items-center gap-2',
    'transition-all duration-150 flex-shrink-0 border flex items-center gap-2',
  ],
  [
    'leading-none transition-all duration-300',
    'leading-none transition-all duration-150',
  ],
]);

// 2. Header mobile menu slide-in — open/close must feel snappy
patch('app/components/layout/Header.tsx', [
  [
    'transition-transform duration-300 ease-out',
    'transition-transform duration-150 ease-out',
  ],
]);

// 3. MarketOverview section expand/collapse — should feel instant
patch('app/dashboard/_components/MarketOverview.tsx', [
  [
    'transition-all duration-300 ease-in-out overflow-hidden',
    'transition-all duration-150 ease-in-out overflow-hidden',
  ],
]);

// 4. DashboardLayout sidebar — large panel, slightly slower is fine but 300 feels sluggish
patch('app/components/layout/DashboardLayout.tsx', [
  [
    'transition-all duration-300 flex-shrink-0',
    'transition-all duration-200 flex-shrink-0',
  ],
]);

// 5. Sidebar label text on hover-expand — reduce from 300 to 200
patch('app/components/layout/Sidebar.tsx', [
  [
    'transition-all duration-300 overflow-hidden',
    'transition-all duration-200 overflow-hidden',
  ],
]);

console.log('\nAll transitions patched.');
