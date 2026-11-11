// ============================================================================
// CẤU HÌNH GỬI EMAIL — sửa các giá trị bên dưới để nhận email khi có khách
// điền form Liên hệ trên website.
//
// Bạn có thể:
//  (A) Điền thẳng giá trị vào đây (đơn giản nhất), HOẶC
//  (B) Đặt qua biến môi trường trên server (an toàn hơn, không lộ mật khẩu
//      trong code khi đưa lên Git): SMTP_HOST, SMTP_PORT, SMTP_USER,
//      SMTP_PASS, MAIL_TO — biến môi trường sẽ được ưu tiên dùng trước.
//
// Nếu dùng Gmail: phải bật xác minh 2 bước rồi tạo "Mật khẩu ứng dụng"
// (App Password) tại https://myaccount.google.com/apppasswords — KHÔNG
// dùng mật khẩu đăng nhập Gmail thường, Google sẽ chặn.
// ============================================================================

module.exports = {
  // Máy chủ SMTP. Ví dụ Gmail: smtp.gmail.com — Outlook: smtp.office365.com
  host: process.env.SMTP_HOST || 'smtp.gmail.com',

  // Cổng SMTP: 587 (khuyên dùng, secure: false) hoặc 465 (secure: true)
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : false,

  // Tài khoản email dùng để GỬI đi (vd: email công ty trên Gmail/Outlook)
  user: process.env.SMTP_USER || 'ten-email-cua-ban@gmail.com',

  // Mật khẩu ứng dụng (App Password) — KHÔNG phải mật khẩu đăng nhập thường
  pass: process.env.SMTP_PASS || 'dan-mat-khau-ung-dung-16-ky-tu-vao-day',

  // Email sẽ NHẬN yêu cầu liên hệ từ khách (có thể trùng với "user" ở trên)
  to: process.env.MAIL_TO || 'lienhe@baobisonha.vn'
};
