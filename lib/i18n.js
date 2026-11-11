const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { translateHtmlSafe } = require('./translator');

const CACHE_DIR = path.join(__dirname, '..', 'locales', 'cache');

// Keys whose value must never be sent to the translator (IDs, numbers,
// step counters, and the language's own code/label, which we set by hand).
const SKIP_KEYS = new Set(['id', 'code', 'step', 'num', 'label', 'shortName', 'legalName', 'img']);

const LANG_LABELS = { en: 'English', zh: '中文' };

function hashOf(data) {
  return crypto.createHash('sha1').update(JSON.stringify(data)).digest('hex');
}

function collectLeaves(node, currentPath, out) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectLeaves(item, [...currentPath, i], out));
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (SKIP_KEYS.has(key)) continue;
      collectLeaves(value, [...currentPath, key], out);
    }
  } else if (typeof node === 'string') {
    out.push({ path: currentPath, text: node });
  }
}

function setAtPath(root, targetPath, value) {
  let cursor = root;
  for (let i = 0; i < targetPath.length - 1; i++) cursor = cursor[targetPath[i]];
  cursor[targetPath[targetPath.length - 1]] = value;
}

// Small concurrency-limited mapper so we don't fire 60+ parallel requests
// at Google's free endpoint (and don't wait 60+ requests in series either).
async function mapWithConcurrency(items, limit, worker) {
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const i = cursor++;
      await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

async function translateTree(viData, targetLang) {
  const clone = JSON.parse(JSON.stringify(viData));
  const leaves = [];
  collectLeaves(clone, [], leaves);

  await mapWithConcurrency(leaves, 5, async (leaf) => {
    const translated = await translateHtmlSafe(leaf.text, targetLang);
    setAtPath(clone, leaf.path, translated);
  });

  clone.code = targetLang;
  clone.label = LANG_LABELS[targetLang] || targetLang;
  return clone;
}

/**
 * Returns the locale tree for `langCode`, auto-translated from `viData`.
 * - 'vi' is returned as-is (it's the source of truth).
 * - Other languages are served from locales/cache/<lang>.json whenever the
 *   cached sourceHash still matches the current vi.json content.
 * - If vi.json changed (or no cache exists yet), this re-translates every
 *   string via Google Translate and rewrites the cache file.
 *
 * Because caching is keyed on the *whole-file* hash of vi.json, you can
 * hand-edit a cache file after it's generated (to fix an awkward machine
 * translation) and it will survive untouched until vi.json itself changes.
 */
async function getLocale(langCode, viData) {
  if (langCode === 'vi') return viData;

  const cachePath = path.join(CACHE_DIR, `${langCode}.json`);
  const viHash = hashOf(viData);

  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      if (cached.sourceHash === viHash) return cached.data;
    } catch (err) {
      console.warn(`[i18n] Cache "${langCode}.json" bị lỗi, sẽ dịch lại. (${err.message})`);
    }
  }

  console.log(`[i18n] Nội dung tiếng Việt đã thay đổi hoặc chưa có cache — đang tự động dịch sang "${langCode}"...`);
  const translated = await translateTree(viData, langCode);

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(
    cachePath,
    JSON.stringify({ sourceHash: viHash, generatedAt: new Date().toISOString(), data: translated }, null, 2),
    'utf8'
  );
  console.log(`[i18n] Đã lưu bản dịch "${langCode}" vào locales/cache/${langCode}.json`);
  return translated;
}

module.exports = { getLocale, hashOf };
