const https = require('https');

/**
 * Calls Google Translate's public "single" endpoint (no API key required).
 * This is the same endpoint the Google Translate website itself uses, so it
 * is convenient for small/free projects but is unofficial and rate-limited.
 * For a production site with heavy traffic, swap this function for a paid
 * provider (Google Cloud Translation API, DeepL, Azure Translator, ...) —
 * everything else in lib/i18n.js stays the same.
 */
function translateSegment(text, targetLang, sourceLang = 'vi') {
  return new Promise((resolve, reject) => {
    if (!text || !text.trim()) return resolve(text);

    const url =
      'https://translate.googleapis.com/translate_a/single' +
      `?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const translated = parsed[0].map((part) => part[0]).join('');
            resolve(translated);
          } catch (err) {
            reject(new Error(`Không phân tích được kết quả dịch: ${err.message}`));
          }
        });
      })
      .on('error', reject)
      .setTimeout(10000, function () {
        this.destroy(new Error('Yêu cầu dịch tự động quá thời gian chờ (timeout)'));
      });
  });
}

// Anything that must survive translation untouched: HTML tags (<br>, <strong>...),
// HTML entities (&middot;, &rarr;...), and {placeholder} tokens used in copy.
const PROTECTED_RE = /(<[^>]+>|&[a-zA-Z]+;|\{[a-zA-Z0-9_]+\})/g;

/**
 * Translates a string while shielding HTML tags / entities / {placeholders}
 * from the translation engine, so markup used by the EJS templates survives.
 */
async function translateHtmlSafe(text, targetLang, sourceLang = 'vi') {
  if (typeof text !== 'string' || !text.trim()) return text;

  const tokens = [];
  const masked = text.replace(PROTECTED_RE, (match) => {
    tokens.push(match);
    return ` %%${tokens.length - 1}%% `;
  });

  let translated = await translateSegment(masked, targetLang, sourceLang);
  translated = translated.replace(/%%\s*(\d+)\s*%%/g, (_, i) => tokens[Number(i)] || '');
  // Collapse any double spacing the masking round-trip may have introduced.
  return translated.replace(/\s{2,}/g, ' ').trim();
}

module.exports = { translateSegment, translateHtmlSafe };
