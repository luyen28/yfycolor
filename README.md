# Bao Bì Sơn Hà — Website đa ngôn ngữ (VI / EN / ZH)

## Cài đặt & chạy

```bash
npm install
npm start
```
Mở `http://localhost:3000`.

## Nhận email từ form Liên hệ

Khi khách điền form ở trang Liên hệ, website sẽ gửi một email tới bạn. Cấu hình ở file **`config/mail.config.js`**:

```js
host: 'smtp.gmail.com',   // hoặc smtp.office365.com, smtp SMTP nhà cung cấp khác
port: 587,
user: 'ten-email-cua-ban@gmail.com',
pass: 'mat-khau-ung-dung-16-ky-tu',
to: 'lienhe@baobisonha.vn'   // email sẽ nhận yêu cầu liên hệ
```

**Nếu dùng Gmail:** không dùng mật khẩu đăng nhập thường — Google sẽ chặn. Bạn cần:
1. Bật xác minh 2 bước cho tài khoản Gmail đó.
2. Vào https://myaccount.google.com/apppasswords tạo "Mật khẩu ứng dụng" (App Password).
3. Dán mật khẩu 16 ký tự đó vào `pass`.

Nếu gửi email thất bại (SMTP sai, hết mạng...), khách sẽ thấy thông báo lỗi thân thiện thay vì trang trắng, còn lỗi thật được ghi ra log server (`console.error`) để bạn kiểm tra.

**Cách an toàn hơn (tùy chọn):** thay vì điền trực tiếp vào file, có thể đặt qua biến môi trường trên server — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` — các biến này sẽ được ưu tiên dùng trước giá trị trong file.

## Hình ảnh

Website đã có sẵn 3 khu vực hình ảnh, hiện đang dùng **ảnh minh họa tạm** (file `.svg` màu kraft, có chữ ghi rõ "thay bằng ảnh thật") để bạn thấy ngay bố cục:

- **Trang chủ:** mục "Hình ảnh nhà máy & sản xuất" — 4 ảnh (`public/images/gallery-1.svg` → `gallery-4.svg`)
- **Trang chủ + Sản phẩm:** mỗi sản phẩm có 1 ảnh (`public/images/product-<id>.svg`, id tương ứng trong `locales/vi.json`)
- **Trang Giới thiệu:** 1 ảnh banner nhà xưởng (`public/images/about-hero.svg`)

**Cách thay bằng ảnh thật:** đặt ảnh thật (.jpg/.png) vào `public/images/` **cùng tên file** (ví dụ ghi đè `gallery-1.svg` bằng ảnh thật rồi đổi đuôi thành `gallery-1.jpg`), sau đó sửa đường dẫn tương ứng trong:
- `views/index.ejs` (mục gallery + product-photo)
- `views/products.ejs` (product-photo)
- `views/about.ejs` (about-hero)

Chú thích từng ảnh gallery (tên hiển thị dưới ảnh) sửa ở `locales/vi.json`, mục `home.gallery` — sẽ tự dịch sang EN/ZH như các nội dung khác.

Muốn tạo lại bộ ảnh minh họa tạm: `node scripts/gen-placeholders.js`.

## Dịch tự động từ tiếng Việt

`locales/vi.json` là **nguồn nội dung duy nhất**. Bạn chỉ cần sửa/thêm nội dung ở đây — không phải sửa tay các file tiếng Anh, tiếng Trung nữa.

Khi server khởi động, nó sẽ:
1. Tính "hash" nội dung của `locales/vi.json`.
2. So sánh với `locales/cache/en.json` và `locales/cache/zh.json` — nếu hash khớp (nội dung tiếng Việt chưa đổi), dùng luôn bản dịch đã lưu, **không gọi mạng**.
3. Nếu nội dung tiếng Việt đã thay đổi (hoặc chưa có cache), tự động gọi Google Translate (endpoint miễn phí, không cần API key) để dịch từng đoạn văn bản, rồi lưu kết quả vào `locales/cache/`.

➡️ Bạn chỉ cần sửa `vi.json`, khởi động lại server (hoặc chạy `npm run translate`) là bản EN/ZH tự cập nhật.

### Chạy dịch thủ công (không cần khởi động server)
```bash
npm run translate
```
Hữu ích để "làm nóng" cache trước khi deploy, tránh lần chạy đầu tiên phải chờ gọi API.

### Sửa tay một câu dịch bị chưa ưng ý
Mở trực tiếp `locales/cache/en.json` hoặc `locales/cache/zh.json`, sửa trong phần `data`. Vì cache được khóa theo hash của `vi.json`, bản sửa tay của bạn **sẽ được giữ nguyên** cho đến khi bạn thay đổi nội dung tiếng Việt tương ứng.

### Giới hạn cần lưu ý
- Endpoint dịch dùng ở đây (`translate.googleapis.com`) là endpoint công khai, miễn phí, không chính thức — phù hợp cho website nhỏ, nhưng có thể bị giới hạn tần suất gọi hoặc gián đoạn. Nếu cần độ ổn định cao cho production, nên thay bằng dịch vụ trả phí (Google Cloud Translation API, DeepL, Azure Translator...) — chỉ cần sửa hàm `translateSegment` trong `lib/translator.js`.
- Nếu máy chủ chạy web không có kết nối Internet ra ngoài (hoặc endpoint dịch bị chặn), site vẫn chạy bình thường — các ngôn ngữ chưa dịch được sẽ tạm hiển thị nội dung tiếng Việt cho đến khi dịch thành công.
- Các trường không nên dịch (số điện thoại, ID sản phẩm, số liệu thống kê...) đã được loại trừ sẵn trong `lib/i18n.js` (biến `SKIP_KEYS`).

## Cấu trúc thư mục
```
server.js              Express app + middleware chọn ngôn ngữ theo ?lang= hoặc cookie
lib/translator.js       Gọi Google Translate, bảo vệ thẻ HTML/placeholder khỏi bị dịch hỏng
lib/i18n.js              Quản lý cache dịch theo hash nội dung
scripts/pretranslate.js  CLI: npm run translate
locales/vi.json          Nội dung gốc (tiếng Việt) — sửa ở đây
locales/cache/en.json    Bản dịch tiếng Anh (tự sinh, có thể sửa tay)
locales/cache/zh.json    Bản dịch tiếng Trung (tự sinh, có thể sửa tay)
views/                   Template EJS
public/css/style.css     Giao diện
```
