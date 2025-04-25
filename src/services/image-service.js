const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");

dotenv.config();

// Valida variables de entorno esenciales al iniciar el servicio
const BUCKET_NAME = process.env.S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

if (!BUCKET_NAME || !AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.error("Error: Faltan configuraciones de AWS S3 en las variables de entorno (.env)");
  throw new Error("Configuración de AWS S3 incompleta.");
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  }
});

/**
 * Genera una URL prefirmada para subir un archivo a S3 y la URL pública final.
 * @param {string} contentType - El tipo MIME del archivo (ej. 'image/jpeg').
 * @param {string} [entityType='general'] - Tipo de entidad para organizar en S3 (ej. 'avatars', 'products').
 * @returns {Promise<{signedUrl: string, publicUrl: string, key: string}>}
 */
const generatePresignedPutUrl = async (contentType, entityType = 'general') => {
  if (!contentType || typeof contentType !== 'string') {
    throw new Error("contentType es inválido.");
  }
  if (!BUCKET_NAME) {
    throw new Error("Nombre del bucket S3 no configurado.");
  }

  const fileExtension = contentType.split('/')[1] || 'bin';
  const uniqueKey = `${entityType}/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uniqueKey,
    ContentType: contentType,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const publicUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${uniqueKey}`;

    console.log(`Generated Presigned URL. Key: ${uniqueKey}`);
    return { signedUrl, publicUrl, key: uniqueKey };
  } catch (error) {
    console.error(`Error generando presigned URL para S3:`, error);
    throw new Error(`No se pudo generar la URL prefirmada. ${error.message}`);
  }
};

/**
 * Elimina un objeto de S3 usando su clave.
 * @param {string} key - La clave del objeto S3 a eliminar.
 * @returns {Promise<void>}
 */
const deleteImageFromS3 = async (key) => {
  if (!key || typeof key !== 'string') {
    console.warn("Intento de eliminar imagen S3 con clave inválida:", key);
    return;
  }
  if (!BUCKET_NAME) {
    throw new Error("Nombre del bucket S3 no configurado.");
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
    console.log(`Successfully deleted image from S3. Key: ${key}`);
  } catch (error) {
    console.error(`Error eliminando imagen de S3 (Key: ${key}):`, error);
  }
};

module.exports = {
  generatePresignedPutUrl,
  deleteImageFromS3
};
