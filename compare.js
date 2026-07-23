// Screenshot comparison tool
// Usage: node compare.js [desktop|mobile]

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE = 'https://smartmoneymoscow-cell.github.io/spokoyno-landing/';
const CHROME = path.join(__dirname, '..', '.openclaw', 'tmp', 'chromium', 'chrome-linux64', 'chrome');
const OUT = path.join(__dirname, '..', '.openclaw', 'tmp', 'compare');

async function main() {
  const mode = process.argv[2] || 'both';
  
  fs.mkdirSync(OUT, { recursive: true });
  
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  if (mode === 'desktop' || mode === 'both') {
    console.log('📸 Taking desktop screenshot...');
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(SITE, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    
    // Full page
    await page.screenshot({ path: path.join(OUT, 'desktop_full.png'), fullPage: true });
    
    // Hero section only
    const hero = page.locator('.hero');
    if (await hero.count() > 0) {
      await hero.screenshot({ path: path.join(OUT, 'desktop_hero.png') });
    }
    
    // Cards section
    const how = page.locator('.how');
    if (await how.count() > 0) {
      await how.screenshot({ path: path.join(OUT, 'desktop_cards.png') });
    }
    
    // Order section
    const order = page.locator('.order');
    if (await order.count() > 0) {
      await order.screenshot({ path: path.join(OUT, 'desktop_order.png') });
    }
    
    // Check images
    const imgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(i => ({
        src: i.src.split('/').pop(),
        ok: i.naturalWidth > 0,
        size: i.naturalWidth + 'x' + i.naturalHeight
      }));
    });
    console.log('Images:', JSON.stringify(imgs, null, 2));
    
    await ctx.close();
  }

  if (mode === 'mobile' || mode === 'both') {
    console.log('📸 Taking mobile screenshot...');
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    await page.goto(SITE, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(OUT, 'mobile_full.png'), fullPage: true });
    await page.screenshot({ path: path.join(OUT, 'mobile_viewport.png') });
    
    await ctx.close();
  }

  await browser.close();
  console.log(`\n✅ Screenshots saved to ${OUT}/`);
  console.log('Files:', fs.readdirSync(OUT).join(', '));
}

main().catch(e => { console.error(e); process.exit(1); });
