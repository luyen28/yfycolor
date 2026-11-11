// Sinh ảnh minh họa tạm (placeholder) theo đúng tông màu bao bì kraft đang
// dùng cho site, để có ngay bố cục hình ảnh trong khi chờ ảnh chụp thật.
// Chạy: node scripts/gen-placeholders.js
// Muốn thay bằng ảnh thật: chỉ cần ghi đè file .jpg/.png cùng tên vào
// public/images/ rồi sửa đuôi file tương ứng trong views/*.ejs.

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images');
fs.mkdirSync(OUT_DIR, { recursive: true });

function placeholderSvg({ title, sub, w = 640, h = 480, tone = 'a' }) {
  const tones = {
    a: ['#C9A876', '#8B6F47'],
    b: ['#B4834E', '#6B4A2E'],
    c: ['#D9C6A0', '#9C7A4C'],
    d: ['#A98A5C', '#5E4128']
  };
  const [c1, c2] = tones[tone] || tones.a;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="flute" width="16" height="16" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="transparent"/>
      <rect width="8" height="16" fill="#00000012"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#flute)"/>
  <rect x="${w / 2 - 110}" y="${h / 2 - 78}" width="220" height="156" rx="6" fill="#FFFCF5" fill-opacity="0.14" stroke="#FFFCF5" stroke-width="2" stroke-dasharray="7 6"/>
  <text x="50%" y="${h / 2 - 6}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="26" fill="#FFFCF5">${title}</text>
  <text x="50%" y="${h / 2 + 22}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#FFFCF5" fill-opacity="0.85">${sub}</text>
</svg>`;
}

const images = [
  { file: 'gallery-1.svg', title: 'Nhà xưởng sản xuất', sub: 'Ảnh minh họa — thay bằng ảnh thật', tone: 'a' },
  { file: 'gallery-2.svg', title: 'Dây chuyền in ấn', sub: 'Ảnh minh họa — thay bằng ảnh thật', tone: 'b' },
  { file: 'gallery-3.svg', title: 'Kiểm tra chất lượng', sub: 'Ảnh minh họa — thay bằng ảnh thật', tone: 'c' },
  { file: 'gallery-4.svg', title: 'Đóng gói & giao hàng', sub: 'Ảnh minh họa — thay bằng ảnh thật', tone: 'd' },
  { file: 'about-hero.svg', title: 'Xưởng sản xuất YFY', sub: 'Ảnh minh họa — thay bằng ảnh thật', w: 760, h: 560, tone: 'b' },
  { file: 'product-thung-carton.svg', title: 'Thùng carton', sub: 'Ảnh minh họa sản phẩm', tone: 'a' },
  { file: 'product-tui-giay-kraft.svg', title: 'Túi giấy kraft', sub: 'Ảnh minh họa sản phẩm', tone: 'c' },
  { file: 'product-hop-gap.svg', title: 'Hộp giấy gấp', sub: 'Ảnh minh họa sản phẩm', tone: 'd' },
  { file: 'product-mang-boc.svg', title: 'Màng bọc & đệm lót', sub: 'Ảnh minh họa sản phẩm', tone: 'b' }
];

images.forEach((img) => {
  const svg = placeholderSvg(img);
  fs.writeFileSync(path.join(OUT_DIR, img.file), svg, 'utf8');
});

console.log(`[gen-placeholders] Đã tạo ${images.length} ảnh minh họa trong public/images/`);
