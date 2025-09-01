const express = require('express');
const rateLimit = require('express-rate-limit');
const ImageController = require('../controllers/image-controller');

const router = express.Router();

// Rate-limit defensivo (evita abuso si el endpoint queda público)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60,             // 60 req/min por IP
});
router.use(limiter);

// Presign directo a la ruta final (entity/id/kind)
router.post('/presign/entity-put', ImageController.presignEntityPutOpen);

// Presign genérico con folder + fileName (restringido a roots permitidos)
router.post('/presign/put', ImageController.presignPutOpen);

// Resolver URL de lectura por key (firmada u open)
router.get('/url', ImageController.getUrlFromKey);

// Convertir URL a key
router.post('/url-to-key', ImageController.urlToKey);

// Borrar objeto por key
router.delete('/', ImageController.delete);

module.exports = router;
