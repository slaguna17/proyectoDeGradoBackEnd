const { CopyObjectCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand,} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");

const { s3, S3_BUCKET, basePublicUrl, PRESIGNED_URL_EXPIRES_IN, S3_UPLOAD_MAX_MB, } = require("../config/s3");

// ---------- Helpers ----------
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

function extFromContentType(ct = "") {
  const t = String(ct).toLowerCase();
  if (t.endsWith("webp")) return ".webp";
  if (t.endsWith("png")) return ".png";
  if (t.endsWith("jpeg") || t.endsWith("jpg")) return ".jpg";
  return ".webp";
}

// For Avatar/logo for each entity
function buildFinalKeyForEntity({ entity, entityId, kind = "main", contentType }) {
  // entity: "users" | "stores" | "categories" | "products"
  // kind:   "avatar" | "logo" | "main"
  const ext = extFromContentType(contentType);
  return `${sanitizeFolder(entity)}/${Number(entityId)}/${sanitizeFileName(kind + ext)}`;
}

// ---------- Optional existance ----------
async function headObject(key) {
  const cmd = new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return s3.send(cmd);
}

// ----------Signed URL for reading (GET) ----------
async function getSignedReadUrl(key, expiresIn = PRESIGNED_URL_EXPIRES_IN) {
  const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}

// ---------- Signed URl for direct upload (PUT) ----------
async function getSignedPutUrl({ key, contentType, expiresIn = PRESIGNED_URL_EXPIRES_IN }) {
  if (!contentType) throw new Error("contentType is required");
  const cmd = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, cmd, { expiresIn });
}

// ---------- POST presign ----------
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

// ---------- Key to URL ----------
function publicUrlFromKey(key) {
  return `${basePublicUrl()}/${encodeURI(key)}`;
}

function keyFromUrl(url) {
  try {
    const u = new URL(url);
    return decodeURI(u.pathname.replace(/^\/+/, ""));
  } catch {
    return url;
  }
}

async function deleteObject(key) {
  const cmd = new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key });
  await s3.send(cmd);
}

async function moveObject(oldKey, newKey) {
  if (!oldKey || oldKey === newKey) return newKey;
  await s3.send(
    new CopyObjectCommand({
      Bucket: S3_BUCKET,
      CopySource: `/${S3_BUCKET}/${oldKey}`,
      Key: newKey,
    })
  );
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: oldKey }));
  return newKey;
}

async function attachImageUrl(obj, field = "image", signed = false) {
  const key = obj?.[field];
  if (!key) return obj;
  obj[`${field}_url`] = signed ? await getSignedReadUrl(key) : publicUrlFromKey(key);
  return obj;
}

module.exports = {
  // Sanitation and keys
  buildKey,
  buildFinalKeyForEntity,
  extFromContentType,

  // S3 operations
  headObject,
  getSignedReadUrl,
  getSignedPutUrl,
  getPresignedPost,
  publicUrlFromKey,
  keyFromUrl,
  deleteObject,
  moveObject,
  attachImageUrl,
};
