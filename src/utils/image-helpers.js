const { publicUrlFromKey, getSignedReadUrl, deleteObject } = require("../services/image-service");

function isAbsoluteUrl(v) {
  return typeof v === "string" && /^https?:\/\//i.test(v);
}

async function attachImageUrl(row, field = "image", { signed = true, expiresIn } = {}) {
  if (!row) return row;
  const key = row[field];

  if (!key) {
    row[`${field}_url`] = null;
    return row;
  }

  let resolvedUrl;
  if (isAbsoluteUrl(key)) {
    resolvedUrl = key;
  } else if (signed !== false) {
    try {
      resolvedUrl = await getSignedReadUrl(key, expiresIn);
    } catch (_) {
      resolvedUrl = publicUrlFromKey(key);
    }
  } else {
    resolvedUrl = publicUrlFromKey(key);
  }

  row[`${field}_url`] = resolvedUrl;
  row[`${field}Url`] = resolvedUrl;
  if (field === "logo" || field === "avatar") {
    row.image_url = resolvedUrl;
    row.imageUrl = resolvedUrl;
  }

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
