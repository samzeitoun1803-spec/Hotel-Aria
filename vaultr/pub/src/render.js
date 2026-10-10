const { chromium } = require('playwright');
const [html, outDir, fps = '30', from = '0', to = '31', only = ''] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + html); await p.evaluate(() => window.ready); await p.waitForTimeout(500);
  const times = only ? only.split(',').map(Number) : null;
  const F = +fps, list = times || Array.from({ length: Math.round((+to - +from) * F) }, (_, i) => +from + i / F);
  let n = 0;
  for (const t of list) {
    await p.evaluate(t => window.seek(t), t);
    await p.screenshot({ path: `${outDir}/${times ? 't' + t : 'f' + String(Math.round(t * F)).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
    n++;
  }
  console.log('frames', n, 'errors', errs); await b.close();
})();
