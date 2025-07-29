const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

// 사이트 URL 설정
const hostname = 'https://researcherhojin.github.io/emelmujiro';

// 페이지 목록 정의
const pages = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/#/about', changefreq: 'monthly', priority: 0.8 },
  { url: '/#/profile', changefreq: 'monthly', priority: 0.8 },
  { url: '/#/contact', changefreq: 'monthly', priority: 0.7 },
];

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname });
  const writeStream = createWriteStream(path.join(__dirname, 'public', 'sitemap.xml'));

  sitemap.pipe(writeStream);

  // 페이지 추가
  pages.forEach(page => {
    sitemap.write({
      url: page.url,
      changefreq: page.changefreq,
      priority: page.priority,
      lastmod: new Date().toISOString()
    });
  });

  sitemap.end();

  await streamToPromise(sitemap);
  console.log('Sitemap generated successfully!');
}

generateSitemap().catch(console.error);