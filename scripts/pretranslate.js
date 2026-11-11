// Chạy: npm run translate
// Đọc locales/vi.json, tự động dịch sang các ngôn ngữ còn lại (nếu nội dung
// tiếng Việt đã thay đổi) và ghi kết quả vào locales/cache/<lang>.json.
// Hữu ích để "làm nóng" cache trước khi deploy, tránh việc lần chạy đầu tiên
// của server phải chờ gọi API dịch.

const path = require('path');
const { getLocale } = require('../lib/i18n');

const SUPPORTED_LANGS = ['en', 'zh'];
const viData = require(path.join(__dirname, '..', 'locales', 'vi.json'));

(async () => {
  for (const lang of SUPPORTED_LANGS) {
    try {
      await getLocale(lang, viData);
    } catch (err) {
      console.error(`[translate] Dịch sang "${lang}" thất bại: ${err.message}`);
      process.exitCode = 1;
    }
  }
  console.log('[translate] Hoàn tất.');
})();
