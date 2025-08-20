const { S3Client } = require("@aws-sdk/client-s3");

const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const S3_BUCKET  = process.env.S3_BUCKET;

// Fallback si aún usas AWS_KEY
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Opcionales
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || "";
const PRESIGNED_URL_EXPIRES_IN = Number(process.env.PRESIGNED_URL_EXPIRES_IN || 300);
const S3_UPLOAD_MAX_MB = Number(process.env.S3_UPLOAD_MAX_MB || 8);

const s3 = new S3Client({
  region: AWS_REGION,
  credentials:
    AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
      ? { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY }
      : undefined,
});

// --- Helpers ---
function basePublicUrl() {
  return CLOUDFRONT_DOMAIN
    ? `https://${CLOUDFRONT_DOMAIN}`
    : `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;
}

module.exports = {
  s3,
  AWS_REGION,
  S3_BUCKET,
  CLOUDFRONT_DOMAIN,
  PRESIGNED_URL_EXPIRES_IN,
  S3_UPLOAD_MAX_MB,
  basePublicUrl,
};
