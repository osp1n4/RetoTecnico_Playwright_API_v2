const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const reportHtml = path.resolve(__dirname, '..', 'src', 'reports', 'cucumber_report.html');
  const outPdf = path.resolve(__dirname, '..', 'src', 'reports', 'cucumber_report.pdf');
  console.log('Report HTML:', reportHtml);
  console.log('Output PDF:', outPdf);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto('file://' + reportHtml);
  // wait for content to load (messages script populates DOM)
  await page.waitForSelector('#content', { timeout: 5000 }).catch(() => {});
  // give a short delay for scripts to render
  await page.waitForTimeout(500);
  await page.pdf({ path: outPdf, format: 'A4' });
  await browser.close();
  console.log('PDF generated:', outPdf);
})();
