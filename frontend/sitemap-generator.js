const { SitemapStream, streamToPromise } = require('sitemap');
const { writeFileSync } = require('fs');
const path = require('path');

// 사이트 URL 설정
const hostname = 'https://researcherhojin.github.io/emelmujiro';

// 페이지 목록 정의
const pages = [
  {
    url: '/',
    changefreq: 'weekly',
    priority: 1.0,
    img: [
      {
        url: '/og-image.png',
        caption: '에멜무지로 - AI 교육 및 컨설팅 전문 기업',
        title: '에멜무지로 메인 이미지',
      },
    ],
  },
  {
    url: '/#/about',
    changefreq: 'monthly',
    priority: 0.9,
    img: [],
  },
  {
    url: '/#/profile',
    changefreq: 'monthly',
    priority: 0.8,
    img: [],
  },
  {
    url: '/#/contact',
    changefreq: 'monthly',
    priority: 0.8,
    img: [],
  },
  {
    url: '/#/blog',
    changefreq: 'daily',
    priority: 0.7,
    img: [],
  },
];

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname });
  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');

  // 페이지 추가
  pages.forEach((page) => {
    sitemap.write({
      url: page.url,
      changefreq: page.changefreq,
      priority: page.priority,
      lastmod: new Date().toISOString(),
    });
  });

  sitemap.end();

  // XML 스트림을 문자열로 변환
  const sitemapBuffer = await streamToPromise(sitemap);
  const sitemapXML = sitemapBuffer.toString();

  // 수동으로 XML 포맷팅
  const formattedXML = formatXML(sitemapXML);
  writeFileSync(sitemapPath, formattedXML);

  console.log('Sitemap generated successfully!');
}

// XML 포맷팅 함수
function formatXML(xml) {
  const PADDING = '  '; // 2 spaces
  let formatted = '';
  let indent = '';

  // XML 선언을 분리
  const xmlDeclaration = xml.match(/^<\?xml[^?]*\?>/)?.[0] || '';
  let xmlContent = xml.replace(/^<\?xml[^?]*\?>/, '');

  // 태그 분리 및 포맷팅
  xmlContent = xmlContent
    .replace(/></g, '>\n<')
    .replace(/(<urlset[^>]*>)/g, '\n$1\n')
    .replace(/<\/urlset>/g, '\n</urlset>');

  const lines = xmlContent.split('\n').filter((line) => line.trim());

  formatted = xmlDeclaration + '\n';

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('</')) {
      indent = indent.substring(PADDING.length);
      formatted += indent + trimmedLine + '\n';
    } else if (trimmedLine.startsWith('<') && !trimmedLine.includes('</')) {
      formatted += indent + trimmedLine + '\n';
      if (!trimmedLine.includes('/>') && !trimmedLine.includes('</')) {
        indent += PADDING;
      }
    } else {
      formatted += indent + trimmedLine + '\n';
    }
  });

  return formatted;
}

generateSitemap().catch(console.error);
