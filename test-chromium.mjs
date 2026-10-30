import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});
try {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
  await page.goto('https://www.scribd.com/document/924917379/Sample-PDF-1', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  const html = await page.content();
  const urls = [...new Set((html.match(/https:\/\/html\.scribdassets\.com\/[^")\s]+\.jsonp/g) || []))];
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  console.log('TITLE:', title);
  console.log('LEN:', html.length);
  console.log('JSONP_URLS:', urls.length);
  console.log(urls.slice(0,3).join('\n'));
} finally {
  await browser.close();
}
