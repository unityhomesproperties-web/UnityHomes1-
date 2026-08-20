const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  try {
    console.log('Logging in...');
    await page.type('input[placeholder="Enter your email address"]', 'demo@urbanhaven.com');
    await page.type('input[placeholder="Enter password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    console.log('Clicking Landlords tab...');
    // We need to find the Landlord Clients tab
    const tabs = await page.$$('button');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text.includes('Landlord Clients')) {
        await tab.click();
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    console.log('Clicking a landlord...');
    // find a landlord card. It has cursor-pointer.
    const landlordCard = await page.$('.cursor-pointer');
    if (landlordCard) {
       await landlordCard.click();
       console.log('Clicked landlord card');
    }
    
    await page.waitForTimeout(2000);
    
    console.log('Done!');
  } catch(e) {
    console.log('TEST SCRIPT ERROR:', e);
  }
  
  await browser.close();
})();
