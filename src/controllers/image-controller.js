const {
  buildKey,
  getSignedPutUrl,
  getPresignedPost,
  getSignedReadUrl,
  publicUrlFromKey,
  keyFromUrl,
  deleteObject,
} = require("../services/image-service");
const { PRESIGNED_URL_EXPIRES_IN, S3_UPLOAD_MAX_MB } = require("../config/s3");

const ImageController = {
  presignPut: async (req, res, next) => {
    try {
      const { folder = "products", fileName, contentType, expiresIn } = req.body || {};
      if (!fileName) return res.status(400).json({ error: "fileName is required" });
      if (!contentType) return res.status(400).json({ error: "contentType is required" });

      const key = buildKey({ folder, fileName });
      const url = await getSignedPutUrl({
        key,
        contentType,
        expiresIn: Number(expiresIn || PRESIGNED_URL_EXPIRES_IN),
      });

      res.json({
        method: "PUT",
        key,
        url,
        expiresIn: Number(expiresIn || PRESIGNED_URL_EXPIRES_IN),
        maxMB: S3_UPLOAD_MAX_MB,
      });
    } catch (err) {
      next(err);
    }
  },

  presignPost: async (req, res, next) => {
    try {
      const { folder = "products", fileName, contentType, expiresIn, maxMB } = req.body || {};
      if (!fileName) return res.status(400).json({ error: "fileName is required" });
      if (!contentType) return res.status(400).json({ error: "contentType is required" });

      const key = buildKey({ folder, fileName });
      const data = await getPresignedPost({
        key,
        contentType,
        expiresIn: Number(expiresIn || PRESIGNED_URL_EXPIRES_IN),
        maxMB: Number(maxMB || S3_UPLOAD_MAX_MB),
      });

      res.json({
        method: "POST",
        key,
        url: data.url,
        fields: data.fields,
        expiresIn: Number(expiresIn || PRESIGNED_URL_EXPIRES_IN),
        maxMB: Number(maxMB || S3_UPLOAD_MAX_MB),
      });
    } catch (err) {
      next(err);
    }
  },

  getUrlFromKey: async (req, res, next) => {
    try {
      const { key, signed = "false", expiresIn } = req.query;
      if (!key) return res.status(400).json({ error: "key is required" });
  
      if (/^https?:\/\//i.test(key)) {
        return res.json({ key, url: key, signed: false });
      }

      if (String(signed).toLowerCase() === "true") {
        const url = await getSignedReadUrl(key, Number(expiresIn || PRESIGNED_URL_EXPIRES_IN));
        return res.json({ key, url, signed: true, expiresIn: Number(expiresIn || PRESIGNED_URL_EXPIRES_IN) });
      }
      
      return res.json({ key, url: publicUrlFromKey(key), signed: false });
    
    } catch (err) {
      next(err);
    }
  },

  urlToKey: (req, res) => {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: "url is required" });
    return res.json({ key: keyFromUrl(url) });
  },

  delete: async (req, res, next) => {
    try {
      const { key } = req.body || {};
      if (!key) return res.status(400).json({ error: "key is required" });
      await deleteObject(key);
      res.json({ ok: true, deleted: key });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ImageController;
