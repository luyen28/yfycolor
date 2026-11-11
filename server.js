const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { getLocale } = require('./lib/i18n');
const { sendContactEmail } = require('./lib/mailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- i18n: tiếng Việt là nguồn duy nhất, các ngôn ngữ khác được dịch tự động ---
const SUPPORTED_LANGS = ['vi', 'en', 'zh'];
const viData = require('./locales/vi.json');
const localesCache = { vi: viData };

async function bootstrapLocales() {
  for (const lang of SUPPORTED_LANGS.filter((l) => l !== 'vi')) {
    try {
      localesCache[lang] = await getLocale(lang, viData);
    } catch (err) {
      // Dịch tự động thất bại (vd. không có mạng, endpoint dịch bị chặn) —
      // vẫn cho site chạy, tạm thời hiển thị nội dung tiếng Việt cho ngôn ngữ đó.
      console.warn(`[i18n] Không thể tự động dịch sang "${lang}", tạm dùng nội dung tiếng Việt. Lỗi: ${err.message}`);
      localesCache[lang] = viData;
    }
  }
}

app.use((req, res, next) => {
  let lang = req.query.lang || req.cookies.lang || 'vi';
  if (!SUPPORTED_LANGS.includes(lang)) lang = 'vi';
  if (req.query.lang && req.query.lang !== req.cookies.lang) {
    res.cookie('lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  }
  res.locals.lang = lang;
  res.locals.t = localesCache[lang] || localesCache.vi;
  res.locals.langs = SUPPORTED_LANGS.map((code) => ({
    code,
    label: (localesCache[code] || localesCache.vi).label
  }));
  res.locals.currentPath = req.path;
  next();
});

// Thông tin liên hệ giữ nguyên ở mọi ngôn ngữ (tên riêng / số điện thoại)
const company = {
  phone: '0912 345 678',
  email: 'lienhe@baobiyfy.vn',
  address: 'Lô CN07, KCN Đồng Văn 1 mở rộng, Đồng Văn, Ninh Bình, Việt Nam',
};

app.get('/', (req, res) => {
  res.render('index', { company, page: 'home' });
});

app.get('/gioi-thieu', (req, res) => {
  res.render('about', { company, page: 'about' });
});

app.get('/san-pham', (req, res) => {
  res.render('products', { company, page: 'products' });
});

app.get('/lien-he', (req, res) => {
  res.render('contact', { company, page: 'contact', sent: false, mailError: false });
});

app.post('/lien-he', async (req, res) => {
  const { name, phone, message } = req.body;
  try {
    await sendContactEmail({ name, phone, message });
    res.render('contact', { company, page: 'contact', sent: true, mailError: false });
  } catch (err) {
    console.error('[mail] Gửi email thất bại:', err.message);
    res.render('contact', { company, page: 'contact', sent: false, mailError: true });
  }
});

bootstrapLocales()
  .catch((err) => console.error('[i18n] Lỗi khởi tạo bản dịch:', err))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Website đang chạy tại http://localhost:${PORT}`);
    });
  });
