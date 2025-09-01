const {
  buildKey,
  getSignedPutUrl,
  getSignedReadUrl,
  publicUrlFromKey,
  keyFromUrl,
  deleteObject,
} = require('../services/image-service');

const { PRESIGNED_URL_EXPIRES_IN, S3_UPLOAD_MAX_MB } = require('../config/s3');

// Defensas mínimas si el endpoint es público
const ALLOWED_ENTITIES = new Set(['users', 'stores', 'categories', 'products']);
const ALLOWED_KINDS    = new Set(['avatar', 'logo', 'main']);
const ALLOWED_ROOTS    = new Set(['users', 'stores', 'categories', 'products']);

// Mapea MIME -> extensión final
function extFromMime(mime = '') {
  const m = String(mime).toLowerCase();
  if (m.endsWith('webp')) return '.webp';
  if (m.endsWith('png'))  return '.png';
  if (m.endsWith('jpeg') || m.endsWith('jpg')) return '.jpg';
  return '.webp';
}

// Asegura que la carpeta que te pasan empiece en una root permitida
function ensureAllowedRoot(folder = '') {
  const clean = String(folder).replace(/^\/*|\/*$/g, '');
  const root = clean.split('/')[0] || '';
  if (!ALLOWED_ROOTS.has(root)) {
    const err = new Error('Folder root not allowed');
    err.status = 400;
    throw err;
  }
  return clean;
}

const ImageController = {
  /**
   * Presign directo a ruta final: /{entity}/{id}/{kind}.{ext}
   * Body: { entity: "stores"|"users"|"categories"|"products", entityId: number, kind: "logo"|"avatar"|"main", contentType: "image/*", expiresIn? }
   */
  presignEntityPutOpen: async (req, res, next) => {
    try {
      const { entity, entityId, kind = 'main', contentType, expiresIn } = req.body || {};

      if (!entity || !ALLOWED_ENTITIES.has(entity)) {
        return res.status(400).json({ error: 'Invalid entity' });
      }
      const id = Number(entityId);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid entityId' });
      }
      if (!ALLOWED_KINDS.has(kind)) {
        return res.status(400).json({ error: 'Invalid kind' });
      }
      if (!contentType) {
        return res.status(400).json({ error: 'contentType is required' });
      }

      const ext = extFromMime(contentType);
      const folder = `${entity}/${id}`;
      const fileName = `${kind}${ext}`;
      const key = buildKey({ folder, fileName });

      const url = await getSignedPutUrl({
        key,
        contentType,
        expiresIn: Number(expiresIn || PRESIGNED_URL_EXPIRES_IN),
      });

      res.json({
        method: 'PUT',
        key,
        url,
        expiresIn: Number(expiresIn || PRESIGNED_URL_EXPIRES_IN),
        maxMB: S3_UPLOAD_MAX_MB,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Presign genérico: { folder, fileName, contentType }
   * Restringimos que folder comience en una root conocida (users|stores|categories|products)
   */
  presignPutOpen: async (req, res, next) => {
    try {
      let { folder, fileName, contentType, expiresIn } = req.body || {};
      if (!fileName)     return res.status(400).json({ error: 'fileName is required' });
      if (!contentType)  return res.status(400).json({ error: 'contentType is required' });
      if (!folder)       return res.status(400).json({ error: 'folder is required' });

      folder = ensureAllowedRoot(folder);
      const key = buildKey({ folder, fileName });

      const url = await getSignedPutUrl({
        key,
        contentType,
        expiresIn: Number(expiresIn || PRESIGNED_URL_EXPIRES_IN),
      });

      res.json({
        method: 'PUT',
        key,
        url,
        expiresIn: Number(expiresIn || PRESIGNED_URL_EXPIRES_IN),
        maxMB: S3_UPLOAD_MAX_MB,
      });
    } catch (err) {
      next(err);
    }
  },

  // -------- Resolver URL de lectura (GET) --------
  getUrlFromKey: async (req, res, next) => {
    try {
      const { key, signed = 'false', expiresIn } = req.query;
      if (!key) return res.status(400).json({ error: 'key is required' });

      // Si ya te pasan una URL completa, devuélvela tal cual
      if (/^https?:\/\//i.test(key)) {
        return res.json({ key, url: key, signed: false });
      }

      if (String(signed).toLowerCase() === 'true') {
        const url = await getSignedReadUrl(key, Number(expiresIn || PRESIGNED_URL_EXPIRES_IN));
        return res.json({ key, url, signed: true, expiresIn: Number(expiresIn || PRESIGNED_URL_EXPIRES_IN) });
      }

      return res.json({ key, url: publicUrlFromKey(key), signed: false });
    } catch (err) { next(err); }
  },

  // -------- Convertir URL -> key --------
  urlToKey: (req, res) => {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url is required' });
    return res.json({ key: keyFromUrl(url) });
  },

  // -------- Borrar objeto --------
  delete: async (req, res, next) => {
    try {
      const { key } = req.body || {};
      if (!key) return res.status(400).json({ error: 'key is required' });
      await deleteObject(key);
      res.json({ ok: true, deleted: key });
    } catch (err) { next(err); }
  },
};

module.exports = ImageController;
