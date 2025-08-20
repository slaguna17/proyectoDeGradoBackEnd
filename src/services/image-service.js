const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");

const {
  s3,
  S3_BUCKET,
  basePublicUrl,
  PRESIGNED_URL_EXPIRES_IN,
  S3_UPLOAD_MAX_MB,
} = require("../config/s3");

// ---------- helpers de sanitización ----------
function sanitizeFolder(input = "") {
  const clean = String(input)
    .replace(/^\/*|\/*$/g, "")
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .replace(/\/{2,}/g, "/")
    .slice(0, 200);
  if (clean.includes("..")) throw new Error("Invalid folder");
  return clean;
}

function sanitizeFileName(input = "") {
  const clean = String(input)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(0, 200);
  if (!clean) throw new Error("Invalid fileName");
  if (clean.includes("/") || clean.includes("..")) throw new Error("Invalid fileName");
  return clean;
}

// ---------- Key build ----------
function buildKey({ folder = "", fileName }) {
  const f = sanitizeFolder(folder);
  const n = sanitizeFileName(fileName);
  return f ? `${f}/${n}` : n;
}

// ---------- existencia opcional ----------
async function headObject(key) {
  const cmd = new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return s3.send(cmd);
}

// ---------- URL firmada para lectura (GET) ----------
async function getSignedReadUrl(key, expiresIn = PRESIGNED_URL_EXPIRES_IN) {
  const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}

// ---------- URL firmada para subida directa (PUT) ----------
async function getSignedPutUrl({ key, contentType, expiresIn = PRESIGNED_URL_EXPIRES_IN }) {
  if (!contentType) throw new Error("contentType is required");
  const cmd = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    // ACL: "public-read", // no recomendado; preferir privado + GET firmado o CDN
  });
  return getSignedUrl(s3, cmd, { expiresIn });
}

// ---------- POST presign (alternativa a PUT) ----------
async function getPresignedPost({ key, contentType, maxMB = S3_UPLOAD_MAX_MB, expiresIn = PRESIGNED_URL_EXPIRES_IN }) {
  if (!contentType) throw new Error("contentType is required");
  return createPresignedPost(s3, {
    Bucket: S3_BUCKET,
    Key: key,
    Conditions: [
      ["content-length-range", 0, maxMB * 1024 * 1024],
      ["starts-with", "$Content-Type", contentType.split("/")[0] + "/"],
    ],
    Fields: { "Content-Type": contentType },
    Expires: expiresIn,
  });
}

// ---------- conversiones key <-> url ----------
function publicUrlFromKey(key) {
  return `${basePublicUrl()}/${encodeURI(key)}`;
}

function keyFromUrl(url) {
  try {
    const u = new URL(url);
    return decodeURI(u.pathname.replace(/^\/+/, ""));
  } catch {
    // si no era URL válida, asumimos que ya es una key
    return url;
  }
}

// ---------- borrar objeto ----------
async function deleteObject(key) {
  const cmd = new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key });
  await s3.send(cmd);
}

module.exports = {
  buildKey,
  headObject,
  getSignedReadUrl,
  getSignedPutUrl,
  getPresignedPost,
  publicUrlFromKey,
  keyFromUrl,
  deleteObject,
};
