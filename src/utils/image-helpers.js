const { publicUrlFromKey, getSignedReadUrl, deleteObject } = require("../services/image-service");

function isAbsoluteUrl(v) {
  return typeof v === "string" && /^https?:\/\//i.test(v);
}

async function attachImageUrl(row, field = "image", { signed = false, expiresIn } = {}) {
  if (!row) return row;
  const key = row[field];

  if (!key) {
    row[`${field}_url`] = null;
    return row;
  }

  // 👇 Nuevo: si ya es URL completa (fuera de S3), úsala tal cual
  if (isAbsoluteUrl(key)) {
    row[`${field}_url`] = key;
    return row;
  }

  row[`${field}_url`] = signed
    ? await getSignedReadUrl(key, expiresIn)
    : publicUrlFromKey(key);

  return row;
}

async function attachImageUrlMany(rows, field = "image", opts = {}) {
  return Promise.all((rows || []).map(r => attachImageUrl({ ...r }, field, opts)));
}

async function replaceImageKey(prevKey, newKey) {
  if (prevKey && newKey && prevKey !== newKey) {
    try { await deleteObject(prevKey); } catch (_) {}
  }
  return newKey ?? null;
}

module.exports = { attachImageUrl, attachImageUrlMany, replaceImageKey };
